from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, query, chat

app = FastAPI(title="RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(query.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"status": "RAG API is running"}