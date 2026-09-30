import re
from typing import Dict, Any

OFFICIAL_DISCLOSURES = [
    r"#sponsored\b",
    r"#advertisement\b",
    r"#ad\b",
    r"#paidpartnership\b",
    r"paid partnership",
    r"sponsored by\b",
    r"sponsored content",
    r"ad:\s*",
    r"promotional post",
    r"sebi registered (?:ra|ia)"
]

PROMOTIONAL_SIGNALS = [
    r"use (?:code|promo|referral)",
    r"referral (?:code|link)",
    r"join (?:my|our) (?:vip|premium|channel)",
    r"discount code",
    r"affiliate link",
    r"commission earned",
    r"invest20"
]

def detect_disclosure(text: str) -> Dict[str, Any]:
    """
    Evaluates whether the content contains formal sponsorship disclosures
    or promotional elements without formal disclosure.
    """
    # 1. Check for official disclosures
    for pat in OFFICIAL_DISCLOSURES:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            return {
                "detected": True,
                "status": "Disclosure detected",
                "trigger_text": match.group(0),
                "explanation": "Clear promotional or sponsorship disclosure was detected in the content."
            }

    # 2. Check for promotional signals without disclosure
    for pat in PROMOTIONAL_SIGNALS:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            return {
                "detected": False,
                "status": "Possible promotional content",
                "trigger_text": match.group(0),
                "explanation": "Commercial conversion mechanics or referral terms detected without an explicit '#Sponsored' or 'Paid Partnership' disclosure tag."
            }

    # 3. No disclosure detected
    return {
        "detected": False,
        "status": "No disclosure detected",
        "trigger_text": None,
        "explanation": "No formal sponsorship, advertisement tag, or commercial disclosure was detected in the text. Note: 'No disclosure detected' must not be interpreted as proof of regulatory non-compliance."
    }
