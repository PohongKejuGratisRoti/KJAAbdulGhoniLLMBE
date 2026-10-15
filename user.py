from fastapi import APIRouter, HTTPException, Body
from auth import createTwk
from database import verify_user
from pydantic import BaseModel

userrouter = APIRouter(
    prefix="/user",
    tags=["User"]
)

class LoginModela(BaseModel):
    username:str
    password:str

@userrouter.post("/login")
async def userlogin(reqBody : LoginModela):
    print("login hit")
    currentUsername = reqBody.username
    currentPasssword = reqBody.password

    if not verify_user(currentUsername, currentPasssword):
        print("invalid credentials" )
        raise HTTPException(status_code=401, detail="Not found")
    token = createTwk(currentUsername)
    print("user", currentUsername, "berhasil login")

    
    return {"username" : reqBody.username, "token":token}


@userrouter.post("/register")
async def userregister():
    print("register hit")
    return "register router done, check for jwt"