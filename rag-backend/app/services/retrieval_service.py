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
    
    return {
    "documents": results["documents"][0:10],
    "distances": results["distances"][0:10]
}