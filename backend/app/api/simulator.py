from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.init_db import SIMULATOR_QUESTIONS
from app.models.database_models import LearningAttempt
from app.models.schemas import SimulatorQuestion, SimulatorAnswerRequest, SimulatorAnswerResponse

router = APIRouter()

# In-memory tracking cache for active session streak/score
user_state = {
    "total_score": 30,
    "streak": 2,
    "correct_count": 3,
    "unlocked_badges": ["First Analysis"]
}

@router.get("/simulator/questions", response_model=List[SimulatorQuestion])
def get_simulator_questions():
    return SIMULATOR_QUESTIONS

@router.post("/simulator/answer", response_model=SimulatorAnswerResponse)
def submit_simulator_answer(req: SimulatorAnswerRequest, db: Session = Depends(get_db)):
    q = next((item for item in SIMULATOR_QUESTIONS if item["id"] == req.question_id), None)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found.")

    is_correct = (req.answer.strip().upper() == q["correct_option"].strip().upper())
    points_awarded = 10 if is_correct else 0

    if is_correct:
        user_state["total_score"] += 10
        user_state["streak"] += 1
        user_state["correct_count"] += 1
    else:
        user_state["streak"] = 0

    # Determine badges
    new_badge = None
    cc = user_state["correct_count"]
    if cc >= 1 and "First Analysis" not in user_state["unlocked_badges"]:
        user_state["unlocked_badges"].append("First Analysis")
        new_badge = "First Analysis"
    if cc >= 3 and "Red Flag Hunter" not in user_state["unlocked_badges"]:
        user_state["unlocked_badges"].append("Red Flag Hunter")
        new_badge = "Red Flag Hunter"
    if cc >= 5 and "Evidence Seeker" not in user_state["unlocked_badges"]:
        user_state["unlocked_badges"].append("Evidence Seeker")
        new_badge = "Evidence Seeker"
    if cc >= 8 and "Smart Verifier" not in user_state["unlocked_badges"]:
        user_state["unlocked_badges"].append("Smart Verifier")
        new_badge = "Smart Verifier"

    # Level computation
    score = user_state["total_score"]
    if score >= 80:
        level = "Master Fraud Sleuth"
    elif score >= 50:
        level = "Senior Verifier"
    elif score >= 20:
        level = "Apprentice Scout"
    else:
        level = "Novice Detective"

    # Persist attempt to DB
    try:
        attempt = LearningAttempt(
            user_id=req.user_id,
            question_id=req.question_id,
            answer=req.answer,
            correct=is_correct,
            points=points_awarded
        )
        db.add(attempt)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving learning attempt: {e}")

    return {
        "correct": is_correct,
        "correct_option": q["correct_option"],
        "explanation": q["explanation"],
        "points": points_awarded,
        "streak": user_state["streak"],
        "total_score": user_state["total_score"],
        "level": level,
        "badge_unlocked": new_badge
    }

@router.get("/simulator/profile")
def get_simulator_profile():
    score = user_state["total_score"]
    if score >= 80:
        level = "Master Fraud Sleuth"
    elif score >= 50:
        level = "Senior Verifier"
    elif score >= 20:
        level = "Apprentice Scout"
    else:
        level = "Novice Detective"

    return {
        "score": user_state["total_score"],
        "streak": user_state["streak"],
        "level": level,
        "badges": user_state["unlocked_badges"],
        "all_badges": [
            {"id": "b1", "name": "First Analysis", "desc": "Completed your first verification test", "unlocked": "First Analysis" in user_state["unlocked_badges"]},
            {"id": "b2", "name": "Red Flag Hunter", "desc": "Successfully flagged 3 deceptive posts", "unlocked": "Red Flag Hunter" in user_state["unlocked_badges"]},
            {"id": "b3", "name": "Evidence Seeker", "desc": "Cross-checked 5 claims against primary filings", "unlocked": "Evidence Seeker" in user_state["unlocked_badges"]},
            {"id": "b4", "name": "Smart Verifier", "desc": "Mastered complex financial claim forensics", "unlocked": "Smart Verifier" in user_state["unlocked_badges"]}
        ]
    }
