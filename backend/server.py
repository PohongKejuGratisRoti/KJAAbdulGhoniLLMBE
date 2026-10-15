from pathlib import Path

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:server",
        host="0.0.0.0",
        port=3142,
        app_dir=str(Path(__file__).resolve().parent),
        reload_dirs=[str(Path(__file__).resolve().parent)],
        reload=True
    )
