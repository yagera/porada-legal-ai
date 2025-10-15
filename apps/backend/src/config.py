from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    model_path: str = "/app/models"
    model_name: str = "DeepPavlov/rubert-base-cased"
    
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "porada-documents"
    minio_secure: bool = False
    
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    
    max_file_size: int = 10 * 1024 * 1024
    allowed_extensions: list = [".pdf", ".doc", ".docx", ".txt"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
