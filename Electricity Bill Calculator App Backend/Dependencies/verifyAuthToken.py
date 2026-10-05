from Configuration.firebase_client import get_auth
from typing import Annotated
from fastapi import Header,HTTPException


def verifyToken(authToken: Annotated[str,Header(...,description="Provide Firebase Auth Id Token")]) -> dict:
    auth=get_auth()
    
    try:
        if not authToken.startswith("Bearer_"):
            print("Missing Bearer")         
            raise HTTPException(status_code=401,detail="Invalid authorization header format")
        
        token = authToken.split("Bearer_", 1)[1].strip()

        if not token:
            print("Missing token")
            raise HTTPException(status_code=401,detail="Missing token")

        decoded = auth.verify_id_token(token,check_revoked=True,clock_skew_seconds=25)
        return decoded
    
    except HTTPException:
        raise  

    except auth.ExpiredIdTokenError:
        print("first")
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
        )
    except auth.RevokedIdTokenError:
        print("second")

        raise HTTPException(
            status_code=401,
            detail="Token has been revoked",
        )
    except auth.InvalidIdTokenError:
        print("third")

        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))