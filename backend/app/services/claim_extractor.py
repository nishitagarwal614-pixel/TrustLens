import re
from typing import List, Dict, Any, Tuple

RECOMMENDATION_PATTERNS = [
    r"\bbuy\b(?:\s+[A-Za-z0-9]+|\s+now|\s+immediately)?",
    r"\bsell\b(?:\s+[A-Za-z0-9]+|\s+now)?",
    r"\binvest\s+(?:₹|in|\$|\d+)",
    r"\baccumulate\b",
    r"\btarget price\b",
    r"\bentry price\b",
    r"\bstop loss\b"
]

def extract_claims_and_recommendations(text: str) -> Tuple[List[Dict[str, Any]], bool]:
    """
    Extracts distinct financial claims and identifies if an investment recommendation is present.
    """
    cleaned = text.strip()
    sentences = [s.strip() for s in re.split(r'[.!?\n]+', cleaned) if len(s.strip()) > 5]

    claims = []
    recommendation_detected = False

    # Check for direct recommendation
    for pat in RECOMMENDATION_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            recommendation_detected = True
            break

    for s in sentences:
        s_lower = s.lower()

        # Future price prediction or return claim
        if any(term in s_lower for term in ["will rise", "will definitely rise", "will double", "will surge", "to rise", "guaranteed profit", "guaranteed to rise", "target of", "next week", "next month", "10x", "50%"]):
            claims.append({
                "text": s,
                "type": "Future price prediction",
                "status": "Unverified",
                "confidence": 0.91
            })
        # Official financial metric / company performance
        elif any(term in s_lower for term in ["revenue", "profit", "quarterly report", "results", "growth", "margin", "ebitda", "pat", "year-over-year", "yoy", "units"]):
            claims.append({
                "text": s,
                "type": "Official financial metric",
                "status": "Unverified",  # will be verified against RAG evidence
                "confidence": 0.88
            })
        # Macroeconomic or educational statement
        elif any(term in s_lower for term in ["interest rate", "borrowing cost", "inflation", "monetary policy", "rbi", "repo rate", "fed", "sectors"]):
            claims.append({
                "text": s,
                "type": "Educational / Macroeconomic statement",
                "status": "Verified",
                "confidence": 0.94
            })
        # Promotional / subscription claim
        elif any(term in s_lower for term in ["referral", "code", "join", "premium", "discount", "tips group"]):
            claims.append({
                "text": s,
                "type": "Promotional / Advisory offer",
                "status": "Unverified",
                "confidence": 0.90
            })
        # Recommendation as a claim
        elif any(re.search(pat, s, re.IGNORECASE) for pat in RECOMMENDATION_PATTERNS):
            claims.append({
                "text": s,
                "type": "Investment recommendation",
                "status": "Unverified",
                "confidence": 0.89
            })

    # If no specific patterns matched individual sentences, create a general claim from the input text
    if not claims:
        claims.append({
            "text": cleaned[:120] + ("..." if len(cleaned) > 120 else ""),
            "type": "Financial assertion",
            "status": "Unverified",
            "confidence": 0.80
        })

    return claims, recommendation_detected
