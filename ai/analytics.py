from abc import ABC, abstractmethod
from typing import Dict, Any, List
from loguru import logger
import time
import cv2
import numpy as np
from shapely.geometry import Point, Polygon

from core.config import config

class AnalyticsPlugin(ABC):
    """Base class for all analytics plugins."""
    @abstractmethod
    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        """Process an ultralytics Result object and return event dictionary."""
        pass

class PeopleCountingPlugin(AnalyticsPlugin):
    """
    Counts the total number of unique people seen by inspecting the ByteTrack IDs.
    """
    def __init__(self):
        self.unique_ids = set()
        logger.info("Initialized PeopleCountingPlugin")

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        current_count = 0
        
        if result.boxes is not None and result.boxes.id is not None:
            cls_ids = result.boxes.cls.cpu().numpy()
            track_ids = result.boxes.id.cpu().numpy()
            
            for cls_id, track_id in zip(cls_ids, track_ids):
                if int(cls_id) == 0:
                    current_count += 1
                    self.unique_ids.add(int(track_id))
                    
        return {
            "current_people_in_frame": current_count,
            "total_unique_people_seen": len(self.unique_ids)
        }

class SpatialAnalyticsPlugin(AnalyticsPlugin):
    """
    Handles Intrusion Detection, Restricted Zones, and Loitering Detection.
    """
    def __init__(self):
        # Maps camera_id -> { track_id: first_seen_timestamp }
        self.loitering_memory: Dict[str, Dict[int, float]] = {}
        logger.info("Initialized SpatialAnalyticsPlugin")

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        if camera_id not in self.loitering_memory:
            self.loitering_memory[camera_id] = {}
            
        # Get the polygon for this specific camera
        zone_coords = config.get_zone_for_camera(camera_id)
        zone_poly = Polygon(zone_coords)
        
        active_intrusions = []
        active_loiterers = []
        current_frame_ids = set()
        
        if result.boxes is not None and result.boxes.id is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            cls_ids = result.boxes.cls.cpu().numpy()
            track_ids = result.boxes.id.cpu().numpy()
            
            for box, cls_id, track_id in zip(boxes, cls_ids, track_ids):
                if int(cls_id) != 0:
                    continue  # Only care about people for now
                    
                track_id = int(track_id)
                current_frame_ids.add(track_id)
                
                # Use bottom center (feet) as the point of intersection
                x1, y1, x2, y2 = box
                center_x = (x1 + x2) / 2
                bottom_y = y2
                feet_point = Point(center_x, bottom_y)
                
                if zone_poly.contains(feet_point):
                    active_intrusions.append(track_id)
                    
                    # Loitering logic
                    now = time.time()
                    if track_id not in self.loitering_memory[camera_id]:
                        self.loitering_memory[camera_id][track_id] = now
                    else:
                        time_spent = now - self.loitering_memory[camera_id][track_id]
                        if time_spent >= config.LOITERING_THRESHOLD_SECONDS:
                            active_loiterers.append(track_id)
                else:
                    # Person left the zone, reset their timer
                    if track_id in self.loitering_memory[camera_id]:
                        del self.loitering_memory[camera_id][track_id]
        
        # Cleanup memory for IDs that disappeared from the frame entirely
        memory = self.loitering_memory[camera_id]
        to_delete = [tid for tid in memory.keys() if tid not in current_frame_ids]
        for tid in to_delete:
            del memory[tid]
            
        # Generate an alert status if there's any active intrusion
        is_alert = len(active_intrusions) > 0
            
        return {
            "zone": zone_coords,
            "intrusions": active_intrusions,
            "loiterers": active_loiterers,
            "alert": is_alert
        }

class QueueAnalyticsPlugin(AnalyticsPlugin):
    """
    Handles Queue Length and Waiting Time Prediction.
    """
    def __init__(self):
        # Maps camera_id -> { track_id: enter_timestamp }
        self.queue_memory: Dict[str, Dict[int, float]] = {}
        # Stores recent wait times (in seconds) for SMA prediction
        self.recent_wait_times: List[float] = []
        logger.info("Initialized QueueAnalyticsPlugin")

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        if camera_id not in self.queue_memory:
            self.queue_memory[camera_id] = {}
            
        queue_coords = config.get_queue_zone_for_camera(camera_id)
        queue_poly = Polygon(queue_coords)
        
        active_in_queue = []
        current_frame_ids = set()
        
        if result.boxes is not None and result.boxes.id is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            cls_ids = result.boxes.cls.cpu().numpy()
            track_ids = result.boxes.id.cpu().numpy()
            
            for box, cls_id, track_id in zip(boxes, cls_ids, track_ids):
                if int(cls_id) != 0:
                    continue
                    
                track_id = int(track_id)
                current_frame_ids.add(track_id)
                
                # Use bottom center
                x1, y1, x2, y2 = box
                center_x = (x1 + x2) / 2
                bottom_y = y2
                feet_point = Point(center_x, bottom_y)
                
                if queue_poly.contains(feet_point):
                    active_in_queue.append(track_id)
                    # Enter queue
                    if track_id not in self.queue_memory[camera_id]:
                        self.queue_memory[camera_id][track_id] = time.time()
                else:
                    # Person left the queue
                    if track_id in self.queue_memory[camera_id]:
                        enter_time = self.queue_memory[camera_id][track_id]
                        time_spent = time.time() - enter_time
                        if time_spent > 2.0: # Ignore walking through rapidly
                            self.recent_wait_times.append(time_spent)
                            if len(self.recent_wait_times) > 10: # Keep last 10
                                self.recent_wait_times.pop(0)
                        del self.queue_memory[camera_id][track_id]
        
        # Cleanup memory for IDs that disappeared completely
        memory = self.queue_memory[camera_id]
        to_delete = [tid for tid in memory.keys() if tid not in current_frame_ids]
        for tid in to_delete:
            del memory[tid]
            
        predicted_wait = 0.0
        if self.recent_wait_times:
            predicted_wait = sum(self.recent_wait_times) / len(self.recent_wait_times)
            
        return {
            "queue_length": len(active_in_queue),
            "predicted_wait_time_seconds": round(predicted_wait, 1)
        }

import random

class IdentityAnalyticsPlugin(AnalyticsPlugin):
    """
    Real OpenCV Appearance-based Re-Identification.
    """
    def __init__(self):
        # Database of known signatures: ID -> histogram
        self.known_signatures = {} 
        self.next_id = 1
        
        # Authorized database (for features 15, 17)
        # We will simulate that ID 1 and 2 are authorized employees
        self.authorized_ids = {1, 2}
        
        # Check In / Check Out state (Feature 16)
        self.employee_presence = {} # employee_id -> last_seen_timestamp
        self.recent_logs = []
        
        logger.info("Initialized IdentityAnalyticsPlugin (Real OpenCV Re-ID + Attendance)")

    def extract_signature(self, image_crop):
        hsv = cv2.cvtColor(image_crop, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1], None, [8, 8], [0, 180, 0, 256])
        cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        return hist.flatten()

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        current_time = time.time()
        auth_in_frame = []
        unauth_count = 0
        
        if result.boxes is not None and result.boxes.id is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            track_ids = result.boxes.id.cpu().numpy()
            
            for box, track_id in zip(boxes, track_ids):
                x1, y1, x2, y2 = map(int, box)
                # Ensure bounds
                h, w = frame.shape[:2]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                if x2 - x1 < 10 or y2 - y1 < 10:
                    continue
                    
                crop = frame[y1:y2, x1:x2]
                sig = self.extract_signature(crop)
                
                # Match against known signatures
                best_match_id = None
                best_score = 0.0
                
                for k_id, k_sig in self.known_signatures.items():
                    score = cv2.compareHist(sig, k_sig, cv2.HISTCMP_CORREL)
                    if score > best_score:
                        best_score = score
                        best_match_id = k_id
                        
                if best_match_id is None or best_score < 0.7:
                    # New person
                    best_match_id = self.next_id
                    self.known_signatures[best_match_id] = sig
                    self.next_id += 1
                else:
                    # Update signature slowly
                    self.known_signatures[best_match_id] = 0.9 * self.known_signatures[best_match_id] + 0.1 * sig
                    
                if best_match_id in self.authorized_ids:
                    auth_in_frame.append(f"Employee {best_match_id}")
                    # Check In logic
                    if best_match_id not in self.employee_presence:
                        self.recent_logs.append({
                            "employee": f"Emp {best_match_id}", 
                            "action": "CHECK IN", 
                            "time": current_time
                        })
                        logger.success(f"✅ Employee {best_match_id} CHECKED IN on {camera_id}")
                    self.employee_presence[best_match_id] = current_time
                else:
                    unauth_count += 1
                    
        # Check out logic (if not seen for > 15 seconds)
        checked_out = []
        for emp_id, last_seen in self.employee_presence.items():
            if current_time - last_seen > 15.0:
                self.recent_logs.append({
                    "employee": f"Emp {emp_id}", 
                    "action": "CHECK OUT", 
                    "time": current_time
                })
                logger.info(f"🚪 Employee {emp_id} CHECKED OUT from {camera_id}")
                checked_out.append(emp_id)
                
        for emp_id in checked_out:
            del self.employee_presence[emp_id]
            
        # Keep only the 4 most recent logs to fit UI
        self.recent_logs = self.recent_logs[-4:]
                    
        return {
            "authorized_employees_in_frame": list(set(auth_in_frame)),
            "unauthorized_count": unauth_count,
            "attendance_logs": self.recent_logs
        }

class ParkingAnalyticsPlugin(AnalyticsPlugin):
    """
    Handles Vehicle Detection and Parking Occupancy.
    """
    def __init__(self):
        # COCO Classes for vehicles: 2=car, 3=motorcycle, 5=bus, 7=truck
        self.vehicle_classes = {2, 3, 5, 7}
        logger.info("Initialized ParkingAnalyticsPlugin")

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        spots = config.get_parking_spots_for_camera(camera_id)
        spot_polys = [Polygon(spot) for spot in spots]
        
        # Array matching spots, true if occupied
        occupied_spots = [False] * len(spots)
        vehicle_count = 0
        
        if result.boxes is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            cls_ids = result.boxes.cls.cpu().numpy()
            
            for box, cls_id in zip(boxes, cls_ids):
                if int(cls_id) not in self.vehicle_classes:
                    continue
                    
                vehicle_count += 1
                
                # Check center of vehicle against spots
                x1, y1, x2, y2 = box
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                center_point = Point(center_x, center_y)
                
                for idx, poly in enumerate(spot_polys):
                    if poly.contains(center_point):
                        occupied_spots[idx] = True
                        
        total_spots = len(spots)
        occupied_count = sum(occupied_spots)
        available_count = total_spots - occupied_count
            
        return {
            "vehicle_count": vehicle_count,
            "total_spots": total_spots,
            "occupied_spots": occupied_count,
            "available_spots": available_count,
            "spot_status": occupied_spots
        }

class TamperAnalyticsPlugin(AnalyticsPlugin):
    """
    Detects Camera Tampering (Lens Covered or Camera Shifted) using OpenCV.
    """
    def __init__(self):
        self.camera_backgrounds: Dict[str, np.ndarray] = {}
        logger.info("Initialized TamperAnalyticsPlugin")

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        # Convert frame to grayscale for fast processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 1. Covered Lens Detection (Mean Brightness)
        mean_brightness = np.mean(gray)
        is_covered = float(mean_brightness) < 10.0  # Extremely dark
        
        # 2. Camera Shift Detection (Structural Difference)
        is_shifted = False
        
        # Resize for faster background comparison
        small_gray = cv2.resize(gray, (320, 240))
        
        if camera_id not in self.camera_backgrounds:
            self.camera_backgrounds[camera_id] = small_gray.astype(float)
        else:
            bg = self.camera_backgrounds[camera_id]
            # Calculate absolute difference
            diff = cv2.absdiff(bg.astype(np.uint8), small_gray)
            mean_diff = np.mean(diff)
            
            # If the difference is massive suddenly, camera was moved
            if mean_diff > 50.0:
                is_shifted = True
                
            # Update background slowly (running average)
            cv2.accumulateWeighted(small_gray, bg, 0.05)
            self.camera_backgrounds[camera_id] = bg
            
        return {
            "tamper_alert": is_covered or is_shifted,
            "is_covered": is_covered,
            "is_shifted": is_shifted,
            "brightness": round(float(mean_brightness), 2)
        }

class EnterpriseSafetyPlugin(AnalyticsPlugin):
    """
    Real OpenCV Classical Computer Vision for Fire & Smoke detection.
    """
    def __init__(self):
        self.active_alerts = {}
        # Background subtractor for smoke
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=False)
        logger.info("Initialized EnterpriseSafetyPlugin (Real OpenCV)")

    def process(self, result, frame, camera_id: str) -> Dict[str, Any]:
        current_time = time.time()
        if camera_id not in self.active_alerts:
            self.active_alerts[camera_id] = []
            
        # Cleanup expired alerts (alerts last 3 seconds)
        self.active_alerts[camera_id] = [
            alert for alert in self.active_alerts[camera_id] 
            if current_time - alert["timestamp"] < 3.0
        ]
            
        current_alerts = [a["type"] for a in self.active_alerts[camera_id]]
        
        # 1. Fire Detection (HSV Thresholding)
        blur = cv2.GaussianBlur(frame, (21, 21), 0)
        hsv = cv2.cvtColor(blur, cv2.COLOR_BGR2HSV)
        
        # Define range for orange/yellow fire
        lower_fire = np.array([10, 50, 50], dtype=np.uint8)
        upper_fire = np.array([35, 255, 255], dtype=np.uint8)
        
        mask_fire = cv2.inRange(hsv, lower_fire, upper_fire)
        # Find contours
        contours, _ = cv2.findContours(mask_fire, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        fire_detected = False
        for c in contours:
            if cv2.contourArea(c) > 40000: # Massive fire size only
                fire_detected = True
                break
                
        if fire_detected and "FIRE_DETECTED" not in current_alerts:
            self.active_alerts[camera_id].append({"type": "FIRE_DETECTED", "timestamp": current_time})
            logger.warning(f"🚨 FIRE DETECTED on {camera_id}")
            
        # 2. Smoke Detection (Moving Gray blobs)
        # Downscale for performance
        small = cv2.resize(frame, (320, 240))
        fg_mask = self.bg_subtractor.apply(small)
        
        # Threshold the foreground
        _, fg_thresh = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        contours_smoke, _ = cv2.findContours(fg_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        smoke_detected = False
        for c in contours_smoke:
            if cv2.contourArea(c) > 30000: # Huge moving gray mass
                # Check if it's gray-ish (smoke)
                x, y, w, h = cv2.boundingRect(c)
                crop = small[y:y+h, x:x+w]
                # If variance in saturation is low, it's mostly gray
                hsv_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
                s_channel = hsv_crop[:,:,1]
                if np.mean(s_channel) < 60: # Low saturation = grayish/white smoke
                    smoke_detected = True
                    break
                    
        if smoke_detected and "SMOKE_DETECTED" not in current_alerts:
            self.active_alerts[camera_id].append({"type": "SMOKE_DETECTED", "timestamp": current_time})
            logger.warning(f"🚨 SMOKE DETECTED on {camera_id}")
            
        active_event_types = [a["type"] for a in self.active_alerts[camera_id]]
            
        return {
            "active_alerts": active_event_types,
            "has_critical_alert": any(e in active_event_types for e in ["FIRE_DETECTED", "SMOKE_DETECTED"])
        }

class AnalyticsEngine:
    """
    Runs a suite of plugins on incoming detections.
    """
    def __init__(self):
        self.plugins: List[AnalyticsPlugin] = [
            PeopleCountingPlugin(),
            SpatialAnalyticsPlugin(),
            QueueAnalyticsPlugin(),
            IdentityAnalyticsPlugin(),
            ParkingAnalyticsPlugin(),
            TamperAnalyticsPlugin(),
            EnterpriseSafetyPlugin()
        ]
        
    def run(self, result, frame, camera_id: str) -> Dict[str, Any]:
        events = {}
        for plugin in self.plugins:
            plugin_name = plugin.__class__.__name__
            try:
                events[plugin_name] = plugin.process(result, frame, camera_id)
            except Exception as e:
                logger.error(f"Plugin {plugin_name} failed: {e}")
        return events
