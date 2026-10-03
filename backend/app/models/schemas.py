from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class EvidenceItem(BaseModel):
    id: Optional[int] = None
    source_name: str = "Unknown source"
    document_title: str = "Web result"
    document_date: Optional[str] = None
    excerpt: str = ""
    relevance: float = 0.0
    source_type: str = "Web Source"
    status: str = "Inconclusive"
    source_url: Optional[str] = None


class ClaimItem(BaseModel):
    id: Optional[int] = None
    text: str
    type: str = "Factual assertion"
    status: str = "Unverified"

    # IMPORTANT:
    # The verification engine can legitimately return
    # None when confidence is unavailable.
    confidence: Optional[float] = None

    reasoning: Optional[str] = None
    verification_explanation: Optional[str] = None

    evidence: List[EvidenceItem] = Field(
        default_factory=list
    )


class RedFlagItem(BaseModel):
    id: Optional[int] = None
    type: str
    severity: str
    explanation: str
    trigger_text: Optional[str] = None


class DisclosureResult(BaseModel):
    detected: bool = False
    status: str = "No disclosure detected"
    trigger_text: Optional[str] = None
    explanation: str = ""


class AnalyzeRequest(BaseModel):
    content: str = Field(
        default="",
        description="Text or extracted content to analyze"
    )
    source_url: Optional[str] = None
    creator_name: Optional[str] = None


class AnalyzeResponse(BaseModel):
    id: Optional[int] = None
    overall_status: str
    risk_level: str

    claims: List[ClaimItem] = Field(
        default_factory=list
    )

    recommendation_detected: bool = False

    red_flags: List[RedFlagItem] = Field(
        default_factory=list
    )

    disclosure: DisclosureResult

    evidence: List[EvidenceItem] = Field(
        default_factory=list
    )

    explanation: str = ""

    created_at: Optional[datetime | str] = None


class ReportCreate(BaseModel):
    post_id: Optional[int] = None
    content_url: Optional[str] = None
    creator_name: Optional[str] = None

    reason: str = Field(
        min_length=2,
        max_length=200
    )

    description: str = Field(
        min_length=2
    )

    detected_claim: Optional[str] = None
    screenshot_name: Optional[str] = None


class ReportResponse(BaseModel):
    id: str

    post_id: Optional[int] = None
    content_url: Optional[str] = None
    creator_name: Optional[str] = None

    reason: str
    description: str
    detected_claim: Optional[str] = None
    screenshot_name: Optional[str] = None

    status: str = "Received"

    created_at: datetime

    regulatory_guidance: Dict[str, Any]


class SimulatorOption(BaseModel):
    id: str
    text: str


class SimulatorQuestion(BaseModel):
    id: str
    title: str
    post_text: str
    author: str
    question: str
    options: List[SimulatorOption]
    explanation: str
    correct_option: str
    points: int = 10
    category: str


class SimulatorAnswerRequest(BaseModel):
    question_id: str
    answer: str
    user_id: Optional[int] = 1


class SimulatorAnswerResponse(BaseModel):
    correct: bool
    correct_option: str
    explanation: str
    points: int
    streak: int
    total_score: int
    level: str
    badge_unlocked: Optional[str] = None


class StatPoint(BaseModel):
    date: str
    verified: int
    unverified: int
    contradicted: int
    high_risk: int


class CategoryCount(BaseModel):
    name: str
    count: int
    severity: str


class DashboardStatsResponse(BaseModel):
    content_analyzed: int
    claims_verified: int
    unverified_claims: int
    high_risk_content: int
    reports_submitted: int

    verification_timeline: List[StatPoint] = Field(
        default_factory=list
    )

    red_flag_categories: List[CategoryCount] = Field(
        default_factory=list
    )

    claim_status_distribution: List[CategoryCount] = Field(
        default_factory=list
    )


class CreatorProfileResponse(BaseModel):
    id: int
    handle: str
    name: str
    bio: Optional[str] = None
    platform: str

    is_registered_verified: bool

    posts_analyzed: int
    verified_claims: int
    unverified_claims: int
    contradicted_claims: int
    promotional_posts: int
    disclosures_detected: int

    recent_posts: List[Dict[str, Any]] = Field(
        default_factory=list
    )