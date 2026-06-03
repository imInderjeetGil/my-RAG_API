from services.embedding_service import generate_embedding
from services.vector_store_service import collection

def search_documents(query: str):
    query_embedding = generate_embedding(query)
    print("Dimensions: ", len(query_embedding))
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=10
    )
    # embedding = generate_embedding("Hello")
    # print(len(embedding))
    
    documents = results.get("documents", [])
    distances = results.get("distances", [])

    return {
    "documents": documents[0] if documents else [],
    "distances": distances[0] if distances else []
}