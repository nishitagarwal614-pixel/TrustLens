from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.claim_extractor import extract_claims_and_recommendations
from app.services.red_flag_detector import detect_red_flags
from app.services.disclosure_detector import detect_disclosure
from app.rag.vector_store import vector_store
from app.ai.verification_engine import verify_claims_with_evidence
from app.ai.llm_provider import llm_provider
from app.models.database_models import Post, Claim, RedFlag, Evidence, Creator

def run_content_analysis(
    content: str,
    source_url: Optional[str] = None,
    creator_name: Optional[str] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Executes the end-to-end verification pipeline:
    1. Extract claims & identify recommendations
    2. Detect red-flags
    3. Detect disclosures
    4. Query RAG vector store for official evidence
    5. Cross-verify claims with evidence
    6. Persist to database if db session provided
    """
    # 1. Claim extraction
    claims, recommendation_detected = extract_claims_and_recommendations(content)

    # 2. Red-flag detection
    red_flags = detect_red_flags(content)

    # 3. Disclosure detection
    disclosure = detect_disclosure(content)

    # 4. RAG search for relevant official evidence
    all_evidence = []
    seen_excerpts = set()

    # Search for full content and individual claims
    for query_text in [content] + [c["text"] for c in claims]:
        ev_matches = vector_store.search(query_text, top_k=2)
        for ev in ev_matches:
            if ev["excerpt"] not in seen_excerpts:
                seen_excerpts.add(ev["excerpt"])
                all_evidence.append(ev)

    # 5. Verification Engine
    overall_status, risk_level, explanation = verify_claims_with_evidence(
        claims=claims,
        evidence_list=all_evidence,
        red_flags=red_flags,
        disclosure=disclosure
    )

    # 6. Check pluggable LLM for extra insights if available
    llm_res = llm_provider.analyze_with_llm(content, all_evidence)
    if llm_res:
        if "explanation" in llm_res and len(llm_res["explanation"]) > 10:
            explanation = llm_res["explanation"]

    # 7. Persist to database
    post_id = None
    if db is not None:
        try:
            # Creator association if provided
            creator_id = None
            if creator_name:
                creator = db.query(Creator).filter(Creator.handle == creator_name).first()
                if not creator:
                    creator = Creator(
                        handle=creator_name,
                        name=creator_name.replace("@", "").capitalize(),
                        platform="Social Media"
                    )
                    db.add(creator)
                    db.flush()
                creator_id = creator.id

            post = Post(
                content=content,
                source_url=source_url,
                creator_id=creator_id,
                overall_status=overall_status,
                risk_level=risk_level,
                recommendation_detected=recommendation_detected,
                disclosure_status=disclosure.get("status", "No disclosure detected"),
                explanation=explanation,
                created_at=datetime.utcnow()
            )
            db.add(post)
            db.flush()
            post_id = post.id

            for c in claims:
                claim_db = Claim(
                    post_id=post.id,
                    claim_text=c["text"],
                    claim_type=c["type"],
                    status=c["status"],
                    confidence=c.get("confidence", 0.85)
                )
                db.add(claim_db)
                db.flush()

                for ev in c.get("evidence", []):
                    ev_db = Evidence(
                        claim_id=claim_db.id,
                        source_name=ev["source_name"],
                        document_title=ev["document_title"],
                        document_date=ev.get("document_date"),
                        excerpt=ev["excerpt"],
                        source_url=ev.get("source_url"),
                        relevance=ev.get("relevance", 0.8),
                        source_type=ev.get("source_type", "Regulatory Filing"),
                        status=ev.get("status", "Supports")
                    )
                    db.add(ev_db)

            for rf in red_flags:
                rf_db = RedFlag(
                    post_id=post.id,
                    category=rf["type"],
                    severity=rf["severity"],
                    explanation=rf["explanation"],
                    trigger_text=rf.get("trigger_text")
                )
                db.add(rf_db)

            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Orchestrator DB Error] {e}")

    return {
        "id": post_id,
        "overall_status": overall_status,
        "risk_level": risk_level,
        "claims": claims,
        "recommendation_detected": recommendation_detected,
        "red_flags": red_flags,
        "disclosure": disclosure,
        "evidence": all_evidence,
        "explanation": explanation,
        "created_at": datetime.utcnow().isoformat()
    }
