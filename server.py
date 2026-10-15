import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:server",
        host="0.0.0.0",
        port=3142,
        reload=True
    )