from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class CBCAnalysisResponse(BaseModel):
    id: int
    report_id: int
    analysis: dict[str, Any]
    summary: dict[str, Any]
    analyzed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
