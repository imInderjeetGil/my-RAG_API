from fastapi import FastAPI
from api.upload import router as upload_router
from api.search import router as search_router

app = FastAPI()

@app.get("/")
def root():
    return {'message':"Rag Backend API running"}

app.include_router(upload_router)
app.include_router(search_router)