from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.models.database_models import (
    Post,
    Claim,
    RedFlag,
    Evidence,
)


router = APIRouter()


def _serialize_evidence(ev: Evidence) -> dict:
    return {
        "id": ev.id,
        "source_name": ev.source_name,
        "document_title": ev.document_title,
        "document_date": ev.document_date,
        "excerpt": ev.excerpt,
        "source_url": ev.source_url,
        "relevance": ev.relevance,
        "source_type": ev.source_type,
        "status": ev.status,
    }


def _serialize_claim(claim: Claim) -> dict:
    return {
        "id": claim.id,
        "text": claim.claim_text,
        "type": claim.claim_type,
        "status": claim.status,
        "confidence": claim.confidence,
        "evidence": [
            _serialize_evidence(ev)
            for ev in claim.evidence_items
        ],
    }


def _serialize_red_flag(flag: RedFlag) -> dict:
    return {
        "id": flag.id,
        "type": flag.category,
        "severity": flag.severity,
        "explanation": flag.explanation,
        "trigger_text": flag.trigger_text,
    }


def _serialize_history_item(post: Post) -> dict:
    return {
        "id": post.id,
        "content": post.content,
        "source_url": post.source_url,
        "creator_handle": (
            post.creator.handle
            if post.creator
            else "Anonymous / Unknown"
        ),
        "overall_status": post.overall_status,
        "risk_level": post.risk_level,
        "claims_count": len(post.claims),
        "red_flags_count": len(post.red_flags),
        "evidence_count": sum(
            len(claim.evidence_items)
            for claim in post.claims
        ),
        "recommendation_detected": bool(
            post.recommendation_detected
        ),
        "disclosure_status": post.disclosure_status,
        "created_at": (
            post.created_at.isoformat()
            if post.created_at
            else None
        ),
    }


@router.get("/history")
def get_verification_history(
    status_filter: Optional[str] = Query(
        None,
        description=(
            "Filter by overall status or risk level. "
            "Examples: Verified, Unverified, "
            "Contradicted, Needs more evidence, High"
        ),
    ),
    limit: int = Query(
        50,
        ge=1,
        le=200,
        description="Maximum number of history records to return.",
    ),
    offset: int = Query(
        0,
        ge=0,
        description="Number of records to skip.",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Post).order_by(Post.created_at.desc())

    posts = query.offset(offset).limit(limit).all()

    if status_filter:
        filter_value = status_filter.strip().lower()

        posts = [
            post
            for post in posts
            if (
                filter_value
                in (post.overall_status or "").lower()
                or filter_value
                in (post.risk_level or "").lower()
            )
        ]

    return {
        "count": len(posts),
        "limit": limit,
        "offset": offset,
        "results": [
            _serialize_history_item(post)
            for post in posts
        ],
    }


@router.get("/analysis/{post_id}")
def get_analysis_detail(
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

    claims = [
        _serialize_claim(claim)
        for claim in post.claims
    ]

    red_flags = [
        _serialize_red_flag(flag)
        for flag in post.red_flags
    ]

    all_evidence = []

    for claim in post.claims:
        for evidence in claim.evidence_items:
            all_evidence.append(
                _serialize_evidence(evidence)
            )

    disclosure_text = (
        post.disclosure_status
        or "No disclosure detected"
    )

    disclosure_lower = disclosure_text.lower()

    disclosure_detected = (
        "detected" in disclosure_lower
        and "no disclosure" not in disclosure_lower
    )

    return {
        "id": post.id,
        "content": post.content,
        "source_url": post.source_url,
        "creator_handle": (
            post.creator.handle
            if post.creator
            else "Anonymous / Unknown"
        ),
        "overall_status": post.overall_status,
        "risk_level": post.risk_level,
        "recommendation_detected": bool(
            post.recommendation_detected
        ),
        "disclosure": {
            "detected": disclosure_detected,
            "status": disclosure_text,
            "explanation": (
                "Disclosure assessment stored "
                "with the original analysis."
            ),
        },
        "claims": claims,
        "red_flags": red_flags,
        "evidence": all_evidence,
        "explanation": (
            post.explanation
            or "Historical analysis record."
        ),
        "created_at": (
            post.created_at.isoformat()
            if post.created_at
            else None
        ),
    }


@router.get("/analysis/{post_id}/claims")
def get_analysis_claims(
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

    return {
        "post_id": post.id,
        "claims": [
            _serialize_claim(claim)
            for claim in post.claims
        ],
    }


@router.get("/analysis/{post_id}/evidence")
def get_analysis_evidence(
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

    evidence_items = []

    for claim in post.claims:
        for evidence in claim.evidence_items:
            item = _serialize_evidence(evidence)
            item["claim_id"] = claim.id
            item["claim_text"] = claim.claim_text
            evidence_items.append(item)

    return {
        "post_id": post.id,
        "count": len(evidence_items),
        "results": evidence_items,
    }


@router.delete("/analysis/{post_id}")
def delete_analysis_record(
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

    db.delete(post)
    db.commit()

    return {
        "status": "success",
        "message": f"Analysis {post_id} removed.",
        "deleted_id": post_id,
    }


@router.delete("/history")
def clear_all_history(
    db: Session = Depends(get_db),
):
    deleted_count = db.query(Post).count()

    db.query(Post).delete(
        synchronize_session=False
    )

    db.commit()

    return {
        "status": "success",
        "message": "All verification history removed.",
        "deleted_count": deleted_count,
    }