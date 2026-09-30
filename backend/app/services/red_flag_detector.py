import re
from typing import List, Dict, Any

RED_FLAG_PATTERNS = [
    {
        "type": "Guaranteed Returns",
        "severity": "High",
        "patterns": [
            r"guaranteed (?:profit|return|gains?|income)",
            r"guaranteed to rise",
            r"risk[- ]?free(?: returns?)?",
            r"100% profit",
            r"sure[- ]?shot (?:returns?|gains?|profit|stock)",
            r"can(?:not|'t) lose",
            r"zero[- ]?risk",
            r"assured returns?",
            r"fixed returns? on (?:equity|crypto|stocks)",
            r"definitely rise",
            r"definitely go up"
        ],
        "explanation": "Financial markets carry inherent risk. Indian and global securities regulations (SEBI/SEC) strictly prohibit guaranteeing returns on equity or market-linked instruments."
    },
    {
        "type": "Urgency",
        "severity": "Medium",
        "patterns": [
            r"buy (?:now|immediately|fast|today)",
            r"act (?:immediately|fast|now)",
            r"limited (?:opportunity|slots?|spots?|time)",
            r"don'?t miss (?:out|this opportunity|this chance)",
            r"last chance",
            r"hurry (?:up)?",
            r"before it'?s too late",
            r"window is closing",
            r"once[- ]in[- ]a[- ]lifetime opportunity"
        ],
        "explanation": "High-urgency language induces fear of missing out (FOMO) and impulsive decision-making without adequate due diligence."
    },
    {
        "type": "Unrealistic claims",
        "severity": "High",
        "patterns": [
            r"double your money (?:quickly|in \d+ days|overnight)",
            r"\b10x\b(?: guaranteed)?",
            r"\b100x\b",
            r"(?:rise|jump|surge) (?:30%|40%|50%|100%) (?:next (?:week|month)|in \d+ days)",
            r"multibagger (?:in \d+ days|guaranteed)",
            r"get ₹?\d+ guaranteed within \d+ days",
            r"turn \d+ into \d+ overnight"
        ],
        "explanation": "Extreme short-term return expectations significantly deviate from standard market performance and are characteristic of speculative pump-and-dump operations."
    },
    {
        "type": "Emotional manipulation",
        "severity": "Medium",
        "patterns": [
            r"everyone (?:is getting rich|is buying)",
            r"you'?ll regret missing this",
            r"only smart investors know this",
            r"why stay poor",
            r"secret (?:loophole|algorithm|trick)",
            r"insider (?:tip|leak|info)",
            r"banks don'?t want you to know"
        ],
        "explanation": "Emotional persuasion leverages psychological triggers (envy, regret, secrecy) rather than verifiable balance-sheet fundamentals."
    },
    {
        "type": "Hidden promotion",
        "severity": "Medium",
        "patterns": [
            r"(?:use|apply) (?:my |our )?(?:code|referral|promo|coupon) [A-Z0-9]+",
            r"invest20",
            r"join (?:my|our) (?:premium|vip|exclusive) (?:group|channel|tips?)",
            r"stock tips group",
            r"telegram (?:channel|group|link)",
            r"whatsapp (?:group|alerts?)",
            r"link in bio to buy",
            r"referral link",
            r"discount for (?:first|next) \d+ (?:members|users)"
        ],
        "explanation": "Content exhibits commercial conversion mechanics, referral compensation incentives, or paid channel funnels that require transparent sponsorship disclosures."
    }
]

def detect_red_flags(text: str) -> List[Dict[str, Any]]:
    """Analyzes text against financial red flag categories and extracts triggers."""
    detected = []
    seen_types = set()

    for category in RED_FLAG_PATTERNS:
        cat_type = category["type"]
        severity = category["severity"]
        explanation = category["explanation"]

        for pat in category["patterns"]:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                trigger = match.group(0)
                # Avoid duplicate trigger categories unless distinct
                detected.append({
                    "type": cat_type,
                    "severity": severity,
                    "explanation": explanation,
                    "trigger_text": trigger
                })
                seen_types.add(cat_type)
                break  # one primary trigger per category rule

    return detected
