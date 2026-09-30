from Configuration.firebase_client import get_auth
from typing import Annotated
from fastapi import Header,HTTPException


def verifyToken(authToken: Annotated[str,Header(...,description="Provide Firebase Auth Id Token")]) -> dict:
    auth=get_auth()
    
    try:
        if not authToken.startswith("Bearer_"):         
            raise HTTPException(status_code=401,detail="Invalid authorization header format")
        
        token = authToken.split("Bearer_", 1)[1].strip()

        if not token:
            raise HTTPException(status_code=401,detail="Missing token")

        decoded = auth.verify_id_token(token,check_revoked=True)
        return decoded
    
    except HTTPException:
        raise  

    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token has been revoked",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))