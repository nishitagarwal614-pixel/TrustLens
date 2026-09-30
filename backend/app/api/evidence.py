import json
from pathlib import Path
from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from typing import Optional
from app.rag.vector_store import vector_store
from app.config import DATA_DIR

router = APIRouter()

@router.get("/evidence/search")
def search_evidence(query: str = Query(..., min_length=2)):
    matches = vector_store.search(query, top_k=5)
    return {
        "query": query,
        "results_count": len(matches),
        "results": matches
    }

@router.get("/evidence/sources")
def list_official_sources():
    vector_store.initialize()
    return vector_store.documents_metadata

@router.post("/documents/upload")
async def upload_document(
    title: str = Form(...),
    issuer: str = Form(...),
    authority: str = Form("Official Regulatory Filing"),
    file: UploadFile = File(...)
):
    # Validate extension
    allowed = [".txt", ".pdf", ".md", ".json"]
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(allowed)}")

    content_bytes = await file.read()
    try:
        content_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_text = content_bytes.decode("latin-1", errors="ignore")

    vector_store.add_document(
        title=title,
        issuer=issuer,
        content=content_text,
        authority=authority
    )

    return {
        "status": "success",
        "message": f"Document '{title}' added to vector knowledge base.",
        "filename": file.filename,
        "chunks_indexed": len(vector_store.chunks)
    }

@router.get("/demo/cases")
def get_demo_cases():
    posts_file = DATA_DIR / "demo_posts" / "sample_posts.json"
    if posts_file.exists():
        with open(posts_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []
