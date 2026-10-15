from typing import Literal

from ollama import chat
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import APIRouter, Depends, HTTPException
from auth import conJWT
from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str = Field(min_length=1, max_length=20000)


class AiModel(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)
    history: list[Message] = Field(default_factory=list, max_length=40)


bearer = HTTPBearer()


def check_user_activity(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    ok, payload = conJWT(creds.credentials)
    if not ok or not payload or not isinstance(payload.get('user'), str):
        raise HTTPException(status_code=401, detail='Invalid or expired token')
    return payload['user']


modelrouter = APIRouter(prefix='/model', tags=['LLM'], dependencies=[Depends(check_user_activity)])


@modelrouter.post('/')
def getanswer(body: AiModel):
    messages = [{'role': 'system', 'content': 'Gunakan bahasa Indonesia.'}]
    messages.extend(message.model_dump() for message in body.history)
    messages.append({'role': 'user', 'content': body.prompt})
    try:
        response = chat(model='deepseek-r1:7b', messages=messages)
    except Exception as exc:
        raise HTTPException(status_code=503, detail='Model belum tersedia. Pastikan Ollama berjalan dan deepseek-r1:7b sudah terpasang.') from exc
    # Keep the original response key compatible with existing clients.
    return {'reponse': str(response.message.content or '')}
