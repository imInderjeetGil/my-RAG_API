import chromadb
import uuid

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="documents"
)

def store_chunks(chunks, embeddings, file):
    
    ids = [str(uuid.uuid4()) for _ in chunks]
    
    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=[
        {"source": file.filename}
        for _ in chunks]
    )