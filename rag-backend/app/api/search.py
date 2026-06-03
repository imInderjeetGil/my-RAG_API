from fastapi import APIRouter
from pydantic import BaseModel
from services.retrieval_service import search_documents

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    
@router.post("/search")
def search(request: SearchRequest):
    
    results = search_documents(request.query)
    
    return {
    "documents": results["documents"][0],
    "distances": results["distances"][0]
}
