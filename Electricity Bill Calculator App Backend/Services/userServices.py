# Services/userServices.py
from Utils.firestoreHelpers import docExists, setDoc


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