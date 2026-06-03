from fastapi import APIRouter, Query
from pydantic import BaseModel
from services.retrieval_service import search_documents

router = APIRouter()
MAX_ANSWER_SNIPPET_LENGTH = 300

class SearchRequest(BaseModel):
    query: str
    
@router.post("/search")
def search(request: SearchRequest):
    
    results = search_documents(request.query)
    
    return {
    "documents": results["documents"],
    "distances": results["distances"]
}

@router.post("/ask")
def ask(question: str = Query(...)):
    results = search_documents(question)
    documents = [doc for doc in results["documents"] if doc]

    if not documents:
        return {"answer": "No relevant documents found."}

    answer_parts = []
    for index, doc in enumerate(documents[:3], start=1):
        snippet = doc.strip()
        if len(snippet) > MAX_ANSWER_SNIPPET_LENGTH:
            head = snippet[:MAX_ANSWER_SNIPPET_LENGTH]
            truncated = head.rsplit(" ", 1)[0] if " " in head else head
            snippet = truncated.strip() + "..."
        answer_parts.append(f"{index}. {snippet}")

    return {"answer": "\n\n".join(answer_parts)}
