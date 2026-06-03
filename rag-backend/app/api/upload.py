from fastapi import APIRouter, File, UploadFile
import os
from services.chunk_service import create_chunks
from services.pdf_service import extract_text
from services.embedding_service import generate_embedding
from services.vector_store_service import store_chunks


router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR,exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        text = extract_text(file_path)
        chunks = create_chunks(text)
        embeddings = []
        
        for chunk in chunks:
            embedding = generate_embedding(chunk)
            embeddings .append(embedding)
        store_chunks(chunks, embeddings,file)
        
    return {
        "message":"File uploaded successfully",
        "filename":file.filename,
        "characters":len(text),
        "chunks": len(chunks),
        "first_chunk": chunks[0],
        "preview":text[:500]
    }
