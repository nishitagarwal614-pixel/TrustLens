import re
from typing import List, Dict, Any

def chunk_document(text: str, metadata: Dict[str, Any], max_chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Chunks document text into semantic paragraphs with attached metadata.
    """
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    chunks = []
    chunk_index = 0

    for para in paragraphs:
        # If paragraph is within reasonable size, use it directly
        if len(para) <= max_chunk_size:
            chunks.append({
                "chunk_id": f"{metadata.get('id', 'doc')}_{chunk_index}",
                "text": para,
                "metadata": metadata
            })
            chunk_index += 1
        else:
            # Split into sub-sentences
            sentences = re.split(r'(?<=[.!?])\s+', para)
            current_chunk = []
            current_len = 0

            for sent in sentences:
                sent_len = len(sent)
                if current_len + sent_len > max_chunk_size and current_chunk:
                    chunk_text = " ".join(current_chunk)
                    chunks.append({
                        "chunk_id": f"{metadata.get('id', 'doc')}_{chunk_index}",
                        "text": chunk_text,
                        "metadata": metadata
                    })
                    chunk_index += 1
                    # Keep overlap
                    current_chunk = [current_chunk[-1]] if len(current_chunk) > 1 else []
                    current_len = len(current_chunk[0]) if current_chunk else 0

                current_chunk.append(sent)
                current_len += sent_len

            if current_chunk:
                chunks.append({
                    "chunk_id": f"{metadata.get('id', 'doc')}_{chunk_index}",
                    "text": " ".join(current_chunk),
                    "metadata": metadata
                })
                chunk_index += 1

    return chunks
