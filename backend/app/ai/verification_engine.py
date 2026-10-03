
# import os
# import json
# from typing import List, Dict, Any, Tuple
# from dotenv import load_dotenv
# from google import genai
# from google.genai import types

# # Load environment variables from .env
# load_dotenv()

# # Read your custom key name and set the client
# api_key = os.getenv("LLM_API_KEY") or os.getenv("GEMINI_API_KEY")

# if not api_key:
#     print("[WARNING] Neither LLM_API_KEY nor GEMINI_API_KEY found in environment or .env file.")
#     client = None
# else:
#     client = genai.Client(api_key=api_key)


# def verify_claims_with_evidence(
#     claims: List[Dict[str, Any]],
#     evidence_list: List[Dict[str, Any]],
#     red_flags: List[Dict[str, Any]],
#     disclosure: Dict[str, Any]
# ) -> Tuple[str, str, str]:
#     print("================ DEBUG INFO ================")
#     print(f"1. CLAIMS COUNT: {len(claims)}")
#     print(f"   CLAIMS CONTENT: {claims}")
#     print(f"2. EVIDENCE COUNT: {len(evidence_list)}")
#     print(f"   EVIDENCE CONTENT: {evidence_list}")
#     print(f"3. CLIENT INITIALIZED: {client is not None}")
#     print("============================================")
#     """
#     Evaluates claims against retrieved evidence and red flags dynamically using Gemini.
#     Returns: (overall_status, risk_level, explanation)
#     """
#     if not claims:
#         return "Unverified", "Low", "No verifiable factual claims were detected in the input content."

#     # If no evidence was retrieved at all, default claims to Unverified
#     if not evidence_list:
#         for claim in claims:
#             claim["status"] = "Unverified"
#             claim["evidence"] = []
#         return "Unverified", "Medium", "No corroborating public records or regulatory filings could be retrieved."

#     has_contradiction = False
#     has_verification = False
#     has_unverified = False

#     # Perform Dynamic NLI Verification via Gemini
#     if client:
#         prompt = f"""
# You are a senior financial compliance auditor and fact-checking intelligence system.
# Analyze each claim against the retrieved evidence excerpts.

# CLAIMS TO VERIFY:
# {json.dumps([{"id": i, "claim": c.get("text", "")} for i, c in enumerate(claims)], indent=2)}

# RETRIEVED EVIDENCE:
# {json.dumps([{"id": j, "source": e.get("source", ""), "excerpt": e.get("excerpt", "")} for j, e in enumerate(evidence_list)], indent=2)}

# INSTRUCTIONS:
# 1. Compare each claim strictly against the facts in the evidence.
# 2. Assign a status to each claim:
#    - "Verified": The evidence directly substantiates the core figures or assertion.
#    - "Contradicted": The evidence directly refutes the figures, terms, or factual premise.
#    - "Unverified": The evidence is insufficient, tangentially related, or silent on the claim.
# 3. Link the 0-indexed IDs of matching evidence snippets in "matched_evidence_ids".
# 4. Provide a concise 1-sentence reasoning.

# Return strictly valid JSON matching this schema:
# {{
#   "verifications": [
#     {{
#       "claim_id": 0,
#       "status": "Verified",
#       "matched_evidence_ids": [0],
#       "reasoning": "Official circular confirms the reported interest and threshold."
#     }}
#   ]
# }}
# """
#         try:
#             response = client.models.generate_content(
#                 model="gemini-2.5-flash",
#                 contents=prompt,
#                 config=types.GenerateContentConfig(
#                     response_mime_type="application/json"
#                 ),
#             )
#             data = json.loads(response.text)

#             for item in data.get("verifications", []):
#                 idx = item.get("claim_id")
#                 if isinstance(idx, int) and 0 <= idx < len(claims):
#                     st = item.get("status", "Unverified")
#                     claims[idx]["status"] = st
#                     claims[idx]["reasoning"] = item.get("reasoning", "")
                    
#                     matched_ids = item.get("matched_evidence_ids", [])
#                     matched_evs = [
#                         evidence_list[eid] for eid in matched_ids
#                         if isinstance(eid, int) and 0 <= eid < len(evidence_list)
#                     ]
#                     claims[idx]["evidence"] = matched_evs

#                     if st == "Contradicted":
#                         has_contradiction = True
#                     elif st == "Verified":
#                         has_verification = True
#                     elif st == "Unverified":
#                         has_unverified = True

#         except Exception as e:
#             print(f"[Verification Engine Error] Fallback triggered due to API issue: {e}")
#             _keyword_fallback(claims, evidence_list)
#             for c in claims:
#                 if c.get("status") == "Verified":
#                     has_verification = True
#                 elif c.get("status") == "Contradicted":
#                     has_contradiction = True
#                 else:
#                     has_unverified = True
#     else:
#         # Fallback if client failed to initialize
#         _keyword_fallback(claims, evidence_list)
#         for c in claims:
#             if c.get("status") == "Verified":
#                 has_verification = True
#             elif c.get("status") == "Contradicted":
#                 has_contradiction = True
#             else:
#                 has_unverified = True

#     # Assess overall status and risk level
#     high_severity_flags = [f for f in red_flags if f.get("severity") == "High"]
#     med_severity_flags = [f for f in red_flags if f.get("severity") == "Medium"]

#     if has_contradiction:
#         overall_status = "Contradicted"
#         risk_level = "High"
#         explanation = "The content contains claims that directly conflict with audited corporate disclosures, regulatory records, or factual benchmarks."
#     elif high_severity_flags:
#         overall_status = "Potential Risk"
#         risk_level = "High"
#         flags_str = ", ".join([f.get("type", "Risk Flag") for f in high_severity_flags])
#         explanation = f"Critical red flags were detected ({flags_str}). The claim makes aggressive or guaranteed return assertions unsupported by verifiable regulatory filings."
#     elif med_severity_flags or disclosure.get("status") == "Possible promotional content":
#         overall_status = "Potential Risk"
#         risk_level = "Medium"
#         explanation = "The content displays urgency, marketing funnel mechanics, or promotional incentives without formal sponsorship disclosures."
#     elif has_verification and not has_unverified:
#         overall_status = "Verified"
#         risk_level = "Safe"
#         explanation = "All extracted claims are corroborated by official filings, published announcements, or verified sources."
#     elif has_verification and has_unverified:
#         overall_status = "Partially Verified"
#         risk_level = "Low"
#         explanation = "Some statements are supported by official documents, while other assertions lack direct documentary corroboration."
#     else:
#         overall_status = "Unverified"
#         risk_level = "Medium" if claims else "Low"
#         explanation = "No reliable supporting evidence was found in the available official and regulatory sources."

#     return overall_status, risk_level, explanation


# def _keyword_fallback(claims: List[Dict[str, Any]], evidence_list: List[Dict[str, Any]]):
#     """Token-overlap heuristic fallback in case the LLM API is unavailable."""
#     for claim in claims:
#         claim_words = set(claim.get("text", "").lower().split())
#         matched = []
#         for ev in evidence_list:
#             ev_words = set(ev.get("excerpt", "").lower().split())
#             common_overlap = claim_words.intersection(ev_words)
#             # Match if 4 or more meaningful words align
#             if len(common_overlap) >= 4:
#                 matched.append(ev)
        
#         if matched:
#             claim["status"] = "Verified"
#             claim["evidence"] = matched
#         else:
#             claim["status"] = "Unverified"
#             claim["evidence"] = []
from typing import List, Dict, Any, Tuple


def verify_claims_with_evidence(
    claims: List[Dict[str, Any]],
    evidence_list: List[Dict[str, Any]],
    red_flags: List[Dict[str, Any]],
    disclosure: Dict[str, Any],
) -> Tuple[str, str, str]:
    """
    Safe verification gate.

    This function DOES NOT decide whether a claim is true.

    Claim verification must be performed by the semantic AI
    verification layer using live web evidence.

    If live evidence is unavailable, claims remain unverified.
    No keyword, token-overlap, demo-data, or hard-coded rule
    can mark a claim as Verified.
    """

    if not claims:
        return (
            "Needs more evidence",
            "Medium",
            "No factual claims could be identified for verification.",
        )

    # ---------------------------------------------------------
    # NO LIVE WEB EVIDENCE
    # ---------------------------------------------------------

    if not evidence_list:
        for claim in claims:
            claim["status"] = "Unverified"
            claim["confidence"] = None
            claim["evidence"] = []
            claim["reasoning"] = (
                "No live web evidence was retrieved. "
                "The claim cannot be verified."
            )

        return (
            "Needs more evidence",
            "Medium",
            "No live web evidence could be retrieved for the submitted claims.",
        )

    # ---------------------------------------------------------
    # LIVE EVIDENCE EXISTS
    # ---------------------------------------------------------
    #
    # Evidence exists, but this function still does NOT decide
    # whether it supports or contradicts the claim.
    #
    # Gemini performs that semantic comparison in orchestrator.py.
    # ---------------------------------------------------------

    for claim in claims:
        claim["status"] = "Unverified"
        claim["confidence"] = None
        claim["evidence"] = claim.get("evidence", [])
        claim["reasoning"] = (
            "Live web evidence was retrieved. "
            "Semantic verification is required before the claim "
            "can be marked as verified or contradicted."
        )

    # Red flags may still influence the initial risk indication,
    # but they NEVER prove or disprove a factual claim.
    high_flags = [
        flag
        for flag in red_flags
        if str(flag.get("severity", "")).lower() == "high"
    ]

    medium_flags = [
        flag
        for flag in red_flags
        if str(flag.get("severity", "")).lower() == "medium"
    ]

    if high_flags:
        risk_level = "High"
    elif medium_flags:
        risk_level = "Medium"
    else:
        risk_level = "Medium"

    return (
        "Needs more evidence",
        risk_level,
        (
            "Live web evidence was retrieved, but no claim is "
            "considered verified until semantic comparison with "
            "that evidence is completed."
        ),
    )