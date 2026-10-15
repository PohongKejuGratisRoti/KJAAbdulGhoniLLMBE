from datetime import datetime, timedelta, timezone
import os 
import jwt

from dotenv import load_dotenv

load_dotenv() #load the environment var

secretkey = os.getenv("SECRET_KEY")

def createTwk(user:str) -> str:
    token = jwt.encode({"user":user, "exp": datetime.now(timezone.utc) + timedelta(minutes=15)}, secretkey, algorithm="HS256")
    return str(token)

def conJWT(token) -> tuple[bool, dict | None]:
    token = token
    try:
        payload = jwt.decode(
        token,
        secretkey,
        algorithms=["HS256"]
    )
        return True, payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return False, None

    except jwt.InvalidTokenError:
        print("Invalid token")
        return False, payload


