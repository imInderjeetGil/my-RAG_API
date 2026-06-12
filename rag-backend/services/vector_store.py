import chromadb
import hashlib
from config import CHROMA_DB_PATH
from services.embedding import get_embedding

client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_or_create_collection(name="documents")
hashes_collection = client.get_or_create_collection(name="file_hashes")

# Progress store — doc_id: list of status messages
progress_store: dict[str, list[str]] = {}
done_store: dict[str, bool] = {}

def file_already_exists(file_hash: str) -> bool:
    results = hashes_collection.get(ids=[file_hash])
    return len(results["ids"]) > 0

def save_file_hash(file_hash: str, filename: str, doc_id: str):
    hashes_collection.add(
        documents=[filename],
        ids=[file_hash],
        metadatas=[{"doc_id": doc_id}]
    )

def get_file_hash(contents: bytes) -> str:
    return hashlib.md5(contents).hexdigest()

def add_chunks(chunks: list[str], doc_id: str):
    embeddings = []
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        embeddings.append(embedding)

    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )

def query_similar(query: str, n_results: int = 5) -> list[str]:
    embedding = get_embedding(query)
    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )
    return results["documents"][0]