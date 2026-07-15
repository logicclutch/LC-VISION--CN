from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, JSONResponse
import cv2
import threading
import time
import asyncio
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI CCTV Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LATEST_DATA = {}
DATA_LOCK = threading.Lock()
connected_websockets = set()

def update_global_state(packet: dict):
    with DATA_LOCK:
        LATEST_DATA[packet["camera_id"]] = packet

@app.get("/")
def health_check():
    return {"status": "running", "active_cameras": list(LATEST_DATA.keys())}

@app.get("/events")
def get_events():
    """Returns the latest analytics events for all cameras."""
    with DATA_LOCK:
        response = {}
        for cam_id, packet in LATEST_DATA.items():
            response[cam_id] = {
                "timestamp": packet["timestamp"],
                "events": packet["events"],
                "fps": packet.get("fps", 0.0)
            }
        return JSONResponse(content=response)

@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    """Real-time WebSocket endpoint for the frontend."""
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            # Gather state
            with DATA_LOCK:
                response = {}
                for cam_id, packet in LATEST_DATA.items():
                    response[cam_id] = {
                        "timestamp": packet["timestamp"],
                        "events": packet["events"],
                        "fps": packet.get("fps", 0.0)
                    }
            # Push payload
            await websocket.send_json(response)
            
            # Target 10 FPS updates for the UI
            await asyncio.sleep(0.1) 
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
    except Exception as e:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)

def generate_mjpeg(camera_id: str):
    """Generator for MJPEG stream."""
    while True:
        with DATA_LOCK:
            packet = LATEST_DATA.get(camera_id)
        
        if packet is None:
            time.sleep(0.1)
            continue
            
        result = packet["detections"]
        annotated_frame = result.plot()
        
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            time.sleep(0.1)
            continue
            
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Throttle stream output to save bandwidth
        time.sleep(0.1)

@app.get("/video")
def video_feed(camera_id: str):
    """
    MJPEG streaming endpoint.
    Usage: /video?camera_id=rtsp://...
    """
    return StreamingResponse(generate_mjpeg(camera_id), media_type="multipart/x-mixed-replace; boundary=frame")
