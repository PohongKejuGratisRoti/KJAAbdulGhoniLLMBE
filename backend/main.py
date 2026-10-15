from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from user import userrouter
from model import modelrouter

server = FastAPI()
server.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_methods=['*'],
    allow_headers=['*'],
)
server.include_router(userrouter)
server.include_router(modelrouter)

DIST = Path(__file__).resolve().parent.parent / 'frontend' / 'dist'
if (DIST / 'assets').is_dir():
    server.mount('/assets', StaticFiles(directory=DIST / 'assets'), name='assets')


@server.get('/')
def index():
    if (DIST / 'index.html').is_file():
        return FileResponse(DIST / 'index.html')
    return {'message': 'Backend aktif. Jalankan npm run dev di frontend atau npm run build untuk menyajikan frontend di sini.'}


@server.post('/deadmanswitch')
def ksv():
    return 'done'
