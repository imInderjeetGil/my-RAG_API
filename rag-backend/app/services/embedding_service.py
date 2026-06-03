import ollama

EMBED_MODEL = "nomic-embed-text"

def generate_embedding(text: str):
    response = ollama.embed(
        model=EMBED_MODEL,
        input=text
    )
    
    return response['embeddings'][0]