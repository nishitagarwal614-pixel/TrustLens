from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class EvidenceItem(BaseModel):
    id: Optional[int] = None
    source_name: str
    document_title: str
    document_date: Optional[str] = None
    excerpt: str
    relevance: float = 0.85
    source_type: str = "Regulatory Filing / Official Disclosure"
    status: str = "Supports"  # Supports, Contradicts, Inconclusive

class ClaimItem(BaseModel):
    id: Optional[int] = None
    text: str
    type: str  # "Future price prediction", "Performance claim", "Official financial metric", "Investment recommendation", "Educational statement"
    status: str  # "Verified", "Partially Verified", "Unverified", "Contradicted"
    confidence: float = 0.85
    evidence: List[EvidenceItem] = []

class RedFlagItem(BaseModel):
    id: Optional[int] = None
    type: str  # "Guaranteed Returns", "Urgency", "Unrealistic claims", "Emotional manipulation", "Hidden promotion"
    severity: str  # "High", "Medium", "Low"
    explanation: str
    trigger_text: Optional[str] = None

class DisclosureResult(BaseModel):
    detected: bool
    status: str  # "Disclosure detected", "Possible promotional content", "No disclosure detected"
    trigger_text: Optional[str] = None
    explanation: str

class AnalyzeRequest(BaseModel):
    content: str = Field(..., min_length=3, description="Financial text to analyze")
    source_url: Optional[str] = None
    creator_name: Optional[str] = None

class AnalyzeResponse(BaseModel):
    id: Optional[int] = None
    overall_status: str  # "Verified", "Partially Verified", "Unverified", "Contradicted", "Potential Risk"
    risk_level: str  # "High", "Medium", "Low", "Safe"
    claims: List[ClaimItem] = []
    recommendation_detected: bool = False
    red_flags: List[RedFlagItem] = []
    disclosure: DisclosureResult
    evidence: List[EvidenceItem] = []
    explanation: str
    created_at: Optional[datetime] = None

class ReportCreate(BaseModel):
    post_id: Optional[int] = None
    content_url: Optional[str] = None
    creator_name: Optional[str] = None
    reason: str
    description: str
    detected_claim: Optional[str] = None
    screenshot_name: Optional[str] = None

class ReportResponse(BaseModel):
    id: str  # TL-XXXXXX
    post_id: Optional[int] = None
    content_url: Optional[str] = None
    creator_name: Optional[str] = None
    reason: str
    description: str
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
    verification_timeline: List[StatPoint]
    red_flag_categories: List[CategoryCount]
    claim_status_distribution: List[CategoryCount]

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
    recent_posts: List[Dict[str, Any]] = []
