from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    learning_attempts = relationship("LearningAttempt", back_populates="user", cascade="all, delete-orphan")


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, index=True)
    handle = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    bio = Column(Text, nullable=True)
    platform = Column(String(50), default="Twitter/X")
    is_registered_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="creator")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=True)
    overall_status = Column(String(50), default="Unverified")
    risk_level = Column(String(20), default="Medium")
    recommendation_detected = Column(Boolean, default=False)
    disclosure_status = Column(String(100), default="No disclosure detected")
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("Creator", back_populates="posts")
    claims = relationship("Claim", back_populates="post", cascade="all, delete-orphan")
    red_flags = relationship("RedFlag", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="post", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    claim_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Unverified")  # Verified, Partially Verified, Unverified, Contradicted
    confidence = Column(Float, default=0.85)

    post = relationship("Post", back_populates="claims")
    evidence_items = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")


class RedFlag(Base):
    __tablename__ = "red_flags"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    category = Column(String(100), nullable=False)  # Guaranteed Returns, Urgency, Unrealistic Claims, etc.
    severity = Column(String(20), default="Medium")  # High, Medium, Low
    explanation = Column(Text, nullable=False)
    trigger_text = Column(String(255), nullable=True)

    post = relationship("Post", back_populates="red_flags")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    source_name = Column(String(200), nullable=False)
    document_title = Column(String(250), nullable=False)
    document_date = Column(String(50), nullable=True)
    excerpt = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    relevance = Column(Float, default=0.0)
    source_type = Column(String(100), default="Regulatory Filing")
    status = Column(String(50), default="Supports")  # Supports, Contradicts, Inconclusive

    claim = relationship("Claim", back_populates="evidence_items")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(20), primary_key=True, index=True)  # TL-XXXXXX
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    content_url = Column(String(500), nullable=True)
    creator_name = Column(String(150), nullable=True)
    reason = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    detected_claim = Column(Text, nullable=True)
    screenshot_name = Column(String(255), nullable=True)
    status = Column(String(50), default="Received")
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="reports")


class LearningAttempt(Base):
    __tablename__ = "learning_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question_id = Column(String(50), nullable=False)
    answer = Column(String(100), nullable=False)
    correct = Column(Boolean, nullable=False)
    points = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="learning_attempts")


class OfficialSource(Base):
    __tablename__ = "official_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    issuer = Column(String(200), nullable=False)
    filing_date = Column(String(50), nullable=True)
    authority = Column(String(100), default="SEBI / Exchanges")
    file_path = Column(String(500), nullable=True)
    content_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
