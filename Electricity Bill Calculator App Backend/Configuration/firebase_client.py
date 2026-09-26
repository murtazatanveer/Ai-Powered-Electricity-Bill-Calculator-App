# Configuration/firebase_client.py
from typing import Optional

import firebase_admin
from firebase_admin import credentials, auth

from Configuration.config import settings, _resolve_creds_path


_app: Optional[firebase_admin.App] = None


def get_firebase_app() -> firebase_admin.App:
    """Return the singleton Firebase Admin app, initializing it on first call."""
    global _app
    if _app is not None:
        return _app

    # Credentials path: Firebase first, else fall back to Firestore creds
    creds_path_str = (
        settings.firebase_credentials_path
        or settings.google_application_credentials
    )
    if not creds_path_str:
        raise RuntimeError(
            "No credentials configured for Firebase Admin. "
            "Set FIREBASE_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS in .env"
        )

    creds_path = _resolve_creds_path(creds_path_str)
    if not creds_path.exists():
        raise FileNotFoundError(f"Firebase credentials not found: {creds_path}")

    # Project ID: Firebase first, else fall back to GCP project
    project_id = settings.firebase_project_id or settings.gcp_project_id

    cred = credentials.Certificate(str(creds_path))
    _app = firebase_admin.initialize_app(cred, {"projectId": project_id})
    return _app


def get_auth() -> auth:
    """Ensure Firebase Admin is initialized, then return the auth module."""
    get_firebase_app()
    return auth