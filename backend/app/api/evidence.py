from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.database_models import (
    Evidence,
    Claim,
    Post,
)


router = APIRouter()


def _serialize_evidence(
    evidence: Evidence,
    claim: Claim | None = None,
) -> dict:
    result = {
        "id": evidence.id,
        "source_name": evidence.source_name,
        "document_title": evidence.document_title,
        "document_date": evidence.document_date,
        "excerpt": evidence.excerpt,
        "source_url": evidence.source_url,
        "relevance": evidence.relevance,
        "source_type": evidence.source_type,
        "status": evidence.status,
    }

    if claim is not None:
        result["claim_id"] = claim.id
        result["claim_text"] = claim.claim_text
        result["claim_status"] = claim.status

        if claim.post:
            result["analysis_id"] = claim.post.id

    return result


@router.get("/evidence/search")
def search_evidence(
    query: str = Query(
        ...,
        min_length=2,
        description=(
            "Search stored live-web evidence by "
            "source, title, excerpt, or URL."
        ),
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    search_term = f"%{query.strip()}%"

    matches = (
        db.query(Evidence)
        .join(Claim, Evidence.claim_id == Claim.id)
        .join(Post, Claim.post_id == Post.id)
        .filter(
            or_(
                Evidence.source_name.ilike(
                    search_term
                ),
                Evidence.document_title.ilike(
                    search_term
                ),
                Evidence.excerpt.ilike(
                    search_term
                ),
                Evidence.source_url.ilike(
                    search_term
                ),
                Claim.claim_text.ilike(
                    search_term
                ),
            )
        )
        .order_by(
            Evidence.relevance.desc(),
            Evidence.id.desc(),
        )
        .limit(limit)
        .all()
    )

    return {
        "query": query,
        "results_count": len(matches),
        "results": [
            _serialize_evidence(
                evidence,
                evidence.claim,
            )
            for evidence in matches
        ],
    }


@router.get("/evidence/sources")
def list_evidence_sources(
    limit: int = Query(
        100,
        ge=1,
        le=500,
    ),
    db: Session = Depends(get_db),
):
    evidence_items = (
        db.query(Evidence)
        .filter(
            Evidence.source_url.isnot(None)
        )
        .order_by(Evidence.id.desc())
        .all()
    )

    sources = []
    seen_urls = set()

    for evidence in evidence_items:
        url = (
            evidence.source_url or ""
        ).strip()

        if not url or url in seen_urls:
            continue

        seen_urls.add(url)

        sources.append(
            {
                "source_name": (
                    evidence.source_name
                    or "Web Source"
                ),
                "document_title": (
                    evidence.document_title
                    or "Web Source"
                ),
                "source_url": url,
                "source_type": (
                    evidence.source_type
                    or "Web Source"
                ),
                "status": evidence.status,
            }
        )

        if len(sources) >= limit:
            break

    return {
        "count": len(sources),
        "results": sources,
    }


@router.get("/evidence/{evidence_id}")
def get_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
):
    evidence = (
        db.query(Evidence)
        .filter(Evidence.id == evidence_id)
        .first()
    )

    if not evidence:
        raise HTTPException(
            status_code=404,
            detail="Evidence record not found.",
        )

    return _serialize_evidence(
        evidence,
        evidence.claim,
    )


@router.get("/analysis/{post_id}/evidence")
def get_post_evidence(
    post_id: int,
    db: Session = Depends(get_db),
):
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Analysis record not found.",
        )

    results = []

    for claim in post.claims:
        for evidence in claim.evidence_items:
            results.append(
                _serialize_evidence(
                    evidence,
                    claim,
                )
            )

    return {
        "analysis_id": post.id,
        "count": len(results),
        "results": results,
    }