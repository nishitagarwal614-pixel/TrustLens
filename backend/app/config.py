import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DOCS_DIR = DATA_DIR / "demo_documents"
DB_PATH = BASE_DIR / "trustlens.db"

# Load environment variables from backend/.env
ENV_FILE = BASE_DIR / "backend" / ".env"
load_dotenv(ENV_FILE)


class Settings(BaseModel):
    PROJECT_NAME: str = "TrustLens AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{DB_PATH}"
    )

    LLM_API_KEY: str = os.getenv(
        "LLM_API_KEY",
        ""
    )

    LLM_PROVIDER: str = os.getenv(
        "LLM_PROVIDER",
        "gemini"
    )

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    DEMO_MODE: bool = True


settings = Settings()