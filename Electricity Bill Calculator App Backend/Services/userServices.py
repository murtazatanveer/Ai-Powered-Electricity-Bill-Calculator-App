# Services/userServices.py
from Utils.firestoreHelpers import docExists, setDoc
from Configuration.firebase_client import get_firebase_app
from firebase_admin import auth

async def userExists(uid: str) -> bool:
    """Check if a user document already exists."""
    return await docExists("Users", uid)


async def createUser(uid: str, email: str | None, fullName: str) -> str:
    """
    Create a new user document in Firestore.

    Returns the Firestore document path.
    """
    await setDoc("Users", uid, {
        "fullName": fullName,
        "email": email,
    })

    return f"Users/{uid}"




async def emailExists(email: str) -> bool:
    
    get_firebase_app()   # ensure initialized (idempotent)
    try:
        auth.get_user_by_email(email)
        return True
    except auth.UserNotFoundError:
        return False
    except Exception:
        # Unexpected Firebase error → treat as not found
        return False