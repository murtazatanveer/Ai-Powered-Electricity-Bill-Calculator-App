
from Configuration.firestore_client import get_db


async def getDoc(collection: str, docId: str) -> dict | None:
    """Fetch a Firestore document. Returns dict or None if missing."""
    db = get_db()
    snap = await db.collection(collection).document(docId).get()
    return snap.to_dict() if snap.exists else None


async def updateDoc(collection: str, docId: str, data: dict) -> None:
    """Update specific fields on a Firestore document."""
    db = get_db()
    await db.collection(collection).document(docId).update(data)


async def setDoc(collection: str, docId: str, data: dict, merge: bool = False) -> None:
    """Set a Firestore document (optionally merging)."""
    db = get_db()
    await db.collection(collection).document(docId).set(data, merge=merge)


async def docExists(collection: str, docId: str) -> bool:
    """Check if a Firestore document exists."""
    db = get_db()
    snap = await db.collection(collection).document(docId).get()
    return snap.exists


async def addDoc(collection: str, data: dict) -> str:
    """
    Add a document to a collection with an auto-generated ID.
    Returns the newly created document's ID.
    """
    db = get_db()
    _, docRef = await db.collection(collection).add(data)
    return docRef.id

async def deleteDoc(collection: str, docId: str) -> None:
    """Delete a Firestore document."""
    db = get_db()
    await db.collection(collection).document(docId).delete()