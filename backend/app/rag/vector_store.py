import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.rag.chunker import chunk_document
from app.rag.embeddings import TextEmbedder
from app.config import DOCS_DIR

class DocumentStore:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.chunk_vectors: List[Dict[str, float]] = []
        self.embedder = TextEmbedder()
        self.documents_metadata: List[Dict[str, Any]] = []
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return
        
        self.chunks = []
        self.documents_metadata = []

        if DOCS_DIR.exists():
            for doc_file in DOCS_DIR.glob("*.txt"):
                try:
                    content = doc_file.read_text(encoding="utf-8")
                    title = doc_file.stem.replace("_", " ").title()
                    
                    # Determine issuer and metadata from content header
                    issuer = "Official Entity"
                    doc_date = "2024-2025"
                    authority = "SEBI / Exchange Disclosures"

                    if "XYZ Ltd" in content:
                        issuer = "XYZ Ltd."
                        title = "XYZ Ltd. Condensed Financial Results for Q3 FY24-25"
                        doc_date = "January 18, 2025"
                        authority = "NSE / BSE Exchange Disclosures"
                    elif "SEBI" in content:
                        issuer = "Securities and Exchange Board of India (SEBI)"
                        title = "SEBI Regulatory Directive on Finfluencers & Advisory (SEBI/HO/MIRSD/2023/142)"
                        doc_date = "August 25, 2023"
                        authority = "SEBI Regulatory Circular"
                    elif "RESERVE BANK OF INDIA" in content:
                        issuer = "Reserve Bank of India (RBI)"
                        title = "RBI Monetary Policy Committee (MPC) Statement"
                        doc_date = "December 08, 2024"
                        authority = "RBI Central Bank"
                    elif "TATA MOTORS" in content:
                        issuer = "Tata Motors Limited"
                        title = "Tata Motors EV & Commercial Financial Review"
                        doc_date = "November 12, 2024"
                        authority = "BSE Corporate Announcements"
                    elif "ABC TECH" in content or "ABC TECHNOLOGIES" in content:
                        issuer = "ABC Technologies Limited"
                        title = "ABC Technologies Audited Financial Results FY24"
                        doc_date = "October 24, 2024"
                        authority = "NSE India Disclosures"

                    meta = {
                        "id": doc_file.stem,
                        "title": title,
                        "issuer": issuer,
                        "date": doc_date,
                        "authority": authority,
                        "file_path": str(doc_file),
                        "source_type": "Official Regulatory / Company Exchange Filing (DEMO DATA)"
                    }
                    self.documents_metadata.append(meta)

                    doc_chunks = chunk_document(content, meta)
                    self.chunks.extend(doc_chunks)
                except Exception as e:
                    print(f"Error reading {doc_file}: {e}")

        # Index vectors
        if self.chunks:
            texts = [c["text"] for c in self.chunks]
            self.embedder.fit(texts)
            self.chunk_vectors = [self.embedder.embed(t) for t in texts]

        self._initialized = True

    def search(self, query: str, top_k: int = 3, threshold: float = 0.12) -> List[Dict[str, Any]]:
        self.initialize()
        if not self.chunks:
            return []

        query_vec = self.embedder.embed(query)
        scored = []

        for i, chunk in enumerate(self.chunks):
            chunk_vec = self.chunk_vectors[i]
            score = self.embedder.cosine_similarity(query_vec, chunk_vec)
            
            # Boost score if explicit keywords or ticker numbers match
            query_lower = query.lower()
            text_lower = chunk["text"].lower()

            # Boost for percentages/numbers matching
            for token in ["8.4%", "40%", "30%", "50%", "xyz", "abc", "interest rate", "repo rate", "ev"]:
                if token in query_lower and token in text_lower:
                    score = min(1.0, score + 0.25)

            if score >= threshold:
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []

        for score, item in scored[:top_k]:
            results.append({
                "source_name": item["metadata"]["issuer"],
                "document_title": item["metadata"]["title"],
                "document_date": item["metadata"]["date"],
                "excerpt": item["text"],
                "relevance": round(float(score), 2),
                "source_type": item["metadata"]["source_type"],
                "source_url": f"https://www.nseindia.com/filings/{item['metadata']['id']}"
            })

        return results

    def add_document(self, title: str, issuer: str, content: str, date: str = "Recent", authority: str = "Official"):
        self.initialize()
        meta = {
            "id": f"uploaded_{len(self.documents_metadata)+1}",
            "title": title,
            "issuer": issuer,
            "date": date,
            "authority": authority,
            "source_type": "Uploaded Official Document"
        }
        self.documents_metadata.append(meta)
        new_chunks = chunk_document(content, meta)
        self.chunks.extend(new_chunks)
        texts = [c["text"] for c in self.chunks]
        self.embedder.fit(texts)
        self.chunk_vectors = [self.embedder.embed(t) for t in texts]

# Singleton instance
vector_store = DocumentStore()
