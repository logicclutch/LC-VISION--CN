import os
from loguru import logger
from ultralytics import YOLO
import numpy as np

from core.config import config

class YoloOpenVINODetector:
    """
    Object detection using YOLO11 exported to OpenVINO.
    OpenVINO provides significant CPU acceleration on Intel architectures.
    """
    
    def __init__(self, model_path: str = config.MODEL_PATH, conf: float = config.CONFIDENCE_THRESHOLD):
        self.conf = conf
        
        logger.info(f"Initializing YOLO base model: {model_path}")
        self.base_model = YOLO(model_path)
        
        # Check if we need to export to OpenVINO
        self.ov_model_path = model_path.replace(".pt", "_openvino_model")
        
        if not os.path.exists(self.ov_model_path):
            logger.info("OpenVINO model not found. Exporting now (this will take a minute)...")
            self.base_model.export(format="openvino", half=False) 
            logger.info("Export complete.")
        else:
            logger.info("Found existing OpenVINO model.")
            
        # Load the OpenVINO model
        logger.info("Loading OpenVINO model into memory...")
        self.model = YOLO(self.ov_model_path, task='detect')
        
        # Warmup the model with a dummy image
        logger.info("Warming up model...")
        dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
        self.model(dummy_img, verbose=False)
        logger.info("Model initialization complete.")

    def detect(self, frame: np.ndarray):
        results = self.model(frame, conf=self.conf, verbose=False)
        return results[0]

    def detect_and_track(self, frame: np.ndarray):
        """
        Runs inference and ByteTrack on a single frame.
        Persists track IDs across frames natively.
        """
        results = self.model.track(
            frame, 
            conf=self.conf, 
            persist=True, 
            tracker="bytetrack.yaml", 
            verbose=False
        )
        return results[0]
