from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import uuid
import io
import asyncio
from PyPDF2 import PdfReader
from services.vector_store import add_chunks, file_already_exists, save_file_hash,get_file_hash, progress_store,done_store, hashes_collection
from config import CHUNK_SIZE, CHUNK_OVERLAP

router = APIRouter()

def chunk_text(text: str) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

def extract_text(filename: str, contents: bytes) -> str:
    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(contents))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.endswith(".txt"):
        return contents.decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")

def process_document(filename: str, contents: bytes, file_hash: str, doc_id: str):
    progress_store[doc_id] = []
    done_store[doc_id] = False

    progress_store[doc_id].append('{"type":"step","key":"extract","status":"loading"}')
    text = extract_text(filename, contents)
    progress_store[doc_id].append('{"type":"step","key":"extract","status":"done"}')

    progress_store[doc_id].append('{"type":"step","key":"chunk","status":"loading"}')
    chunks = chunk_text(text)
    progress_store[doc_id].append(f'{{"type":"step","key":"chunk","status":"done","count":{len(chunks)}}}')

    progress_store[doc_id].append('{"type":"step","key":"embed","status":"loading"}')
    add_chunks(chunks, doc_id)
    save_file_hash(file_hash, filename)
    progress_store[doc_id].append('{"type":"step","key":"embed","status":"done"}')

    done_store[doc_id] = True

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    contents = await file.read()
    file_hash = get_file_hash(contents)

    if file_already_exists(file_hash):
        return {"message": f"'{file.filename}' already uploaded!", "doc_id": None}

    doc_id = str(uuid.uuid4())
    progress_store[doc_id] = []
    done_store[doc_id] = False

    background_tasks.add_task(process_document, file.filename, contents, file_hash, doc_id)
    return {"message": f"'{file.filename}' received!", "doc_id": doc_id}

@router.get("/upload/status/{doc_id}")
async def upload_status(doc_id: str):
    async def event_generator():
        sent = 0
        while True:
            messages = progress_store.get(doc_id, [])
            while sent < len(messages):
                yield f"data: {messages[sent]}\n\n"
                sent += 1
            if done_store.get(doc_id, False):
                break
            await asyncio.sleep(0.3)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/files")
def get_uploaded_files():
    results = hashes_collection.get()
    # files = [
    #     {"filename": doc, "hash": id}
    #     for doc, id in zip(results["documents"], results["ids"])
    # ]
    return {"files": results["documents"]}