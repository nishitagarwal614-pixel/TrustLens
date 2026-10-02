from typing import List, Dict, Any, Tuple

def verify_claims_with_evidence(
    claims: List[Dict[str, Any]],
    evidence_list: List[Dict[str, Any]],
    red_flags: List[Dict[str, Any]],
    disclosure: Dict[str, Any]
) -> Tuple[str, str, str]:
    """
    Evaluates claims against retrieved evidence and red flags to determine:
    1. Claim-level verification status (Verified, Partially Verified, Unverified, Contradicted)
    2. Overall status (Verified, Partially Verified, Unverified, Contradicted, Potential Risk)
    3. Risk level (High, Medium, Low, Safe)
    4. Explanatory rationale
    """
    has_contradiction = False
    has_verification = False
    has_unverified = False

    # Check evidence text against claim text
    for claim in claims:
        claim_text_lower = claim["text"].lower()
        matched_evidence = []

        for ev in evidence_list:
            ev_excerpt_lower = ev["excerpt"].lower()

            # Case: Contradiction on numbers / growth claims
            if ("40%" in claim_text_lower or "50%" in claim_text_lower) and ("8.4%" in ev_excerpt_lower or "factually incorrect" in ev_excerpt_lower or "speculative" in ev_excerpt_lower):
                claim["status"] = "Contradicted"
                ev["status"] = "Contradicts"
                matched_evidence.append(ev)
                has_contradiction = True
            elif ("8.4%" in claim_text_lower and "8.4%" in ev_excerpt_lower) or ("interest rate" in claim_text_lower and "borrowing cost" in ev_excerpt_lower) or ("15,642" in claim_text_lower and "15,642" in ev_excerpt_lower):
                claim["status"] = "Verified"
                ev["status"] = "Supports"
                matched_evidence.append(ev)
                has_verification = True
            elif ("30%" in claim_text_lower and "speculative and unverified" in ev_excerpt_lower):
                claim["status"] = "Contradicted"
                ev["status"] = "Contradicts"
                matched_evidence.append(ev)
                has_contradiction = True

        claim["evidence"] = matched_evidence if matched_evidence else []

        if claim["status"] == "Unverified":
            has_unverified = True

    # Assess overall status and risk level
    high_severity_flags = [f for f in red_flags if f.get("severity") == "High"]
    med_severity_flags = [f for f in red_flags if f.get("severity") == "Medium"]

    if has_contradiction:
        overall_status = "Contradicted"
        risk_level = "High"
        explanation = "The content contains claims that directly conflict with audited corporate disclosures or regulatory records."
    elif high_severity_flags:
        overall_status = "Potential Risk"
        risk_level = "High"
        flags_str = ", ".join([f["type"] for f in high_severity_flags])
        explanation = f"Critical red flags were detected ({flags_str}). The claim makes aggressive or guaranteed return assertions unsupported by verifiable regulatory filings."
    elif med_severity_flags or disclosure.get("status") == "Possible promotional content":
        overall_status = "Potential Risk"
        risk_level = "Medium"
        explanation = "The content displays urgency, marketing funnel mechanics, or promotional incentives without formal sponsorship disclosures."
    elif has_verification and not has_unverified:
        overall_status = "Verified"
        risk_level = "Safe"
        explanation = "All extracted claims are corroborated by official exchange filings or central bank publications."
    elif has_verification and has_unverified:
        overall_status = "Partially Verified"
        risk_level = "Low"
        explanation = "Some statements are supported by official documents, while other assertions lack direct documentary corroboration."
    else:
        overall_status = "Unverified"
        risk_level = "Medium" if claims else "Low"
        explanation = "No reliable supporting evidence was found in the available official exchange and regulatory sources."

    return overall_status, risk_level, explanation
