from ollama import chat
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import APIRouter, Depends, HTTPException
from auth import conJWT
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException
role = [
    {
        'role': 'system',
        'content': (
            "gunakan bahasa indonesia" )
    }
]


def merespon(prompt: str) -> str:
 
    # append user message
    role.append({'role': 'user', 'content': prompt})
    
    # call Ollama
    response = chat(model='deepseek-r1:7b', messages=role)
    
    # get AI reply
    reply = response.message.content
    
    return reply

#routing model LLM
bearer = HTTPBearer() 

class AiModel(BaseModel):
    prompt:str

def check_user_activity(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    ok, payload = conJWT(creds.credentials)
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["user"]

modelrouter = APIRouter(prefix="/model", tags=["LLM"], dependencies=[Depends(check_user_activity)])

@modelrouter.post("/")
async def getanswer(PromptReqBody:AiModel):
    userPrompt = PromptReqBody.prompt
    response = merespon(userPrompt)
    return {"reponse":str(response)}