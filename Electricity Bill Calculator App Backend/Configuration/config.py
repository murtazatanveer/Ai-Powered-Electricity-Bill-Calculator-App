# Configuration/config.py
from pathlib import Path
from functools import lru_cache
import os

from pydantic_settings import BaseSettings, SettingsConfigDict


CONFIG_DIR = Path(__file__).resolve().parent
ENV_FILE = CONFIG_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Required
    gcp_project_id: str

    # Optional / defaults
    google_application_credentials: str | None = None
    firestore_database: str = "(default)"
    firestore_emulator_host: str | None = None
    app_env: str = "development"
    log_level: str = "INFO"

    # Firebase Admin (Auth) — both optional; fall back to GCP values
    firebase_project_id: str | None = None
    firebase_credentials_path: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def _resolve_creds_path(path_str: str) -> Path:
    """Resolve a credentials path relative to Configuration/ if not absolute."""
    p = Path(path_str)
    if not p.is_absolute():
        p = CONFIG_DIR / p
    return p.resolve()


def _apply_google_env() -> None:
    """Export credentials env vars before google-cloud SDK is imported."""
    if settings.google_application_credentials:
        path = _resolve_creds_path(settings.google_application_credentials)
        if not path.exists():
            raise FileNotFoundError(
                f"Service account file not found: {path}\n"
                f"Check GOOGLE_APPLICATION_CREDENTIALS in {ENV_FILE}"
            )
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(path)

    if settings.firestore_emulator_host:
        os.environ["FIRESTORE_EMULATOR_HOST"] = settings.firestore_emulator_host


_apply_google_env()