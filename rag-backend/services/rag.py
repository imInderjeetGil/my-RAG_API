import requests
from config import OLLAMA_BASE_URL, LLM_MODEL
from services.vector_store import query_similar

def generate_answer(query: str) -> str:
    context_chunks = query_similar(query)
    context = "\n\n".join(context_chunks)

    prompt = f"""You are a helpful assistant. You have access to some document context below.

If the question is related to the documents, use the context to answer.
If the question is a general question (like greetings, general knowledge), answer it normally.
If the answer is truly not available anywhere, say "I don't have information about that."

Context:
{context}

Question: {query}

Answer:"""

    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": True
        },
        stream=True
    )
    response.raise_for_status()
    
    for line in response.iter_lines():
        if line:
            import json
            data = json.loads(line)
            if not data.get("done"):
                yield data.get('response', '')