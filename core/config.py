import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List

class AppConfig(BaseSettings):
    """
    Application configuration.
    Loads from environment variables or a .env file.
    No hardcoded values should exist in business logic.
    """
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    
    # Database Settings
    DATABASE_URL: str = Field(
        default="postgresql://admin:admin@localhost:5432/cctv",
        description="PostgreSQL Connection String"
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis Connection String"
    )
    
    # Camera Settings (comma separated if multiple)
    CAMERA_URLS: str = Field(
        default="0",
        description="Comma-separated list of RTSP URLs, video file paths, or camera indices."
    )
    
    @property
    def camera_list(self) -> List[str]:
        return [url.strip() for url in self.CAMERA_URLS.split(",") if url.strip()]
        
    CAMERA_RECONNECT_MAX_RETRIES: int = Field(default=-1)
    CAMERA_RECONNECT_DELAY_SECONDS: float = Field(default=5.0)
    FRAME_BUFFER_SIZE: int = Field(default=3)
    
    # AI Pipeline Settings
    FRAME_SKIP: int = Field(default=3)
    MODEL_PATH: str = Field(default="yolo11n.pt")
    CONFIDENCE_THRESHOLD: float = Field(default=0.4)
    
    # Spatial Analytics Settings
    LOITERING_THRESHOLD_SECONDS: float = Field(default=10.0)
    
    # Dictionary of camera_id to list of polygon points [(x,y), (x,y), ...]
    RESTRICTED_ZONES: dict = Field(
        default={
            # Default test zone (a large square in the center of a 1080p frame)
            "default": [(400, 300), (1500, 300), (1500, 800), (400, 800)]
        }
    )
    
    def get_zone_for_camera(self, camera_id: str) -> list:
        return self.RESTRICTED_ZONES.get(camera_id, self.RESTRICTED_ZONES.get("default"))
        
    # Dictionary of camera_id to list of polygon points for Queues
    QUEUE_ZONES: dict = Field(
        default={
            # Default queue zone (left side of the frame)
            "default": [(0, 100), (300, 100), (300, 1000), (0, 1000)]
        }
    )
    
    def get_queue_zone_for_camera(self, camera_id: str) -> list:
        return self.QUEUE_ZONES.get(camera_id, self.QUEUE_ZONES.get("default"))
        
    # Dictionary of camera_id to list of parking spots (each spot is a list of polygon points)
    PARKING_SPOTS: dict = Field(
        default={
            # 3 dummy spots
            "default": [
                [(1500, 800), (1600, 800), (1600, 1000), (1500, 1000)], # Spot 1
                [(1610, 800), (1710, 800), (1710, 1000), (1610, 1000)], # Spot 2
                [(1720, 800), (1820, 800), (1820, 1000), (1720, 1000)], # Spot 3
            ]
        }
    )
    
    def get_parking_spots_for_camera(self, camera_id: str) -> list:
        return self.PARKING_SPOTS.get(camera_id, self.PARKING_SPOTS.get("default"))
    
config = AppConfig()
