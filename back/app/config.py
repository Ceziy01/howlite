from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import os

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Howlite"
    VERSION: str = "0.1.0"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    JWT_KEY: str = os.getenv("JWT_KEY")
    JWT_ALG: str = os.getenv("JWT_ALG")
    ACCESS_TOKEN_EXPIRES_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRES_MINUTES")
    REFRESH_TOKEN_EXPIRES_DAYS: int = os.getenv("REFRESH_TOKEN_EXPIRES_DAYS")

settings = Settings()