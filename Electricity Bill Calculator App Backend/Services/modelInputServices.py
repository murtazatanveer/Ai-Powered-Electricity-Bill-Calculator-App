from Utils.firestoreHelpers import docExists, setDoc, updateDoc


async def modelInputExists(uid: str) -> bool:
    return await docExists("ModelInputs", uid)


async def saveModelInput(uid: str, data: dict) -> None:
    await setDoc("ModelInputs", uid, data)

async def mergeModelInput(uid: str, partialData: dict) -> None:
    
    await updateDoc("ModelInputs", uid, partialData)