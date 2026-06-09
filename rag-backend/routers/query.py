from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.rag import generate_answer

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/query")
def query(request: QueryRequest):
    return StreamingResponse(
        generate_answer(request.question),
        media_type="text/plain"
    )