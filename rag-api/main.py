from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil, os
import ollama
import chromadb
from chromadb.utils.embedding_functions.ollama_embedding_function import (
    OllamaEmbeddingFunction,
)
from pypdf import PdfReader
import io

app = FastAPI()  # Create the FastAPI application

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app ko allow karo
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to the same ChromaDB collection you built in Step 2
client = chromadb.PersistentClient(path="./chroma_db")

ef = OllamaEmbeddingFunction(
    model_name="nomic-embed-text",
    url="http://localhost:11434",
)

collection = client.get_or_create_collection(
    name="personal_profile",
    embedding_function=ef,
)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    
    file_path = f"./uploaded_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file,f)
    
    if file.filename.endswith(".pdf"):
        reader = PdfReader(file_path)
        text = "\n\n".join([page.extract_text() for page in reader.pages])
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    
    chunks = [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]
    
    # Step 3: Purana data clear karo (naya file upload hua hai)
    collection.delete(where={"source": "profile"})
    
    # Step 4: Naye chunks daalo ChromaDB mein
    collection.add(
        ids=[f"chunk{i}" for i in range(len(chunks))],
        documents=chunks,
        metadatas=[{"source": "profile", "chunk_index": i} for i in range(len(chunks))],
    )
    
    return {"message": f"File uploaded! {len(chunks)} chunks saved."}

@app.post("/ask")  # This creates a GET endpoint at /ask
def ask(question: str):  # FastAPI automatically reads "question" from the URL query string
    # Step 1: RETRIEVE - search ChromaDB for the 2 most relevant chunks
    results = collection.query(
        query_texts=[question],  # ChromaDB converts this to a vector and finds similar chunks
        n_results=2,  # Return the top 2 matches
    )
    # Combine the matching chunks into a single string
    context = "\n\n".join(results["documents"][0])

    # Step 2: AUGMENT - build a prompt that includes the retrieved context
    augmented_prompt = f"""Use the following context to answer the question.
If the context doesn't contain relevant information, say so.

Context:
{context}

Question: {question}"""

    # Step 3: GENERATE - send the augmented prompt to the local LLM
    response = ollama.chat(
        model="qwen2.5:0.5b",
        messages=[{"role": "user", "content": augmented_prompt}],
    )

    # Return the answer along with the context so users can verify the source
    return {
        "question": question,
        "answer": response["message"]["content"],
        "context_used": results["documents"][0],
    }
