from sqlalchemy import (
    Column,
    Integer,
    JSON,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class CBCAnalysis(Base):
    __tablename__ = "cbc_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    report_id = Column(
        Integer,
        ForeignKey("reports.id"),
        nullable=False,
        unique=True,
    )

    analysis = Column(
        JSON,
        nullable=False,
    )

    summary = Column(
        JSON,
        nullable=False,
    )

    analyzed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    report = relationship(
        "Report",
        back_populates="cbc_analysis",
    )
