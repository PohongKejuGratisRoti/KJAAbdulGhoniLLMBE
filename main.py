from fastapi import FastAPI, Request, HTTPException 
from fastapi.middleware.cors import CORSMiddleware
from user import userrouter
from model import modelrouter
from pydantic import BaseModel

server = FastAPI()

server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)

server.include_router(userrouter)
server.include_router(modelrouter)

@server.get("/")
async def pingserver():
    return "server is runnning on port 3142, go to 172.16.10.167:3142 for documentation"

class chatModel(BaseModel):
    prompt:str




@server.post("/deadmanswitch")
def ksv():
    return "done"
