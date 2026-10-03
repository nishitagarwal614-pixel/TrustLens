import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"
DOCS_DIR = DATA_DIR / "demo_documents"
DB_PATH = BASE_DIR / "trustlens.db"

# Explicitly point to backend/.env
ENV_FILE = BASE_DIR / "backend" / ".env"


# =========================================================
# ENVIRONMENT
# =========================================================

# Load the project's backend/.env file.
# override=True ensures these values take precedence over
# stale environment variables from an older terminal session.
load_dotenv(
    ENV_FILE,
    override=True,
)


# =========================================================
# SETTINGS
# =========================================================

class Settings(BaseModel):
    PROJECT_NAME: str = "सतर्क SIGHT AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{DB_PATH}",
    )

    LLM_API_KEY: str = os.getenv(
        "LLM_API_KEY",
        "",
    )

    LLM_PROVIDER: str = os.getenv(
        "LLM_PROVIDER",
        "demo",
    ).strip().lower()

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

    DEMO_MODE: bool = False


settings = Settings()