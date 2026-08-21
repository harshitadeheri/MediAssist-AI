from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.oauth2 import get_current_user
from app.models.user import User

from app.repositories.report_repository import ReportRepository
from app.repositories.cbc_analysis_repository import CBCAnalysisRepository


router = APIRouter(
    prefix="/chatbot",
    tags=["AI Health Assistant"],
)


class ChatRequest(BaseModel):
    message: str
    report_id: int | None = None


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # 1. Validate message
    # --------------------------------------------------
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    # --------------------------------------------------
    # 2. If a report_id was supplied, verify ownership
    # --------------------------------------------------
    if request.report_id is not None:

        report = ReportRepository.get_report_by_id(
            db=db,
            report_id=request.report_id,
            user_id=current_user.id,
        )

        if not report:
            raise HTTPException(
                status_code=404,
                detail="Report not found.",
            )

        # --------------------------------------------------
        # 3. Get CBC analysis
        # --------------------------------------------------
        analysis = CBCAnalysisRepository.get_analysis_by_report(
            db=db,
            report_id=request.report_id,
        )

        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="CBC analysis not found for this report.",
            )

        # --------------------------------------------------
        # 4. Generate a basic response using saved data
        # --------------------------------------------------
        message = request.message.lower()

        if "hemoglobin" in message or "hb" in message:

            hemoglobin = analysis.analysis.get("hemoglobin")

            if hemoglobin is not None:
                response = (
                    f"Your hemoglobin value is {hemoglobin}. "
                    "Hemoglobin is a protein in red blood cells that "
                    "helps carry oxygen throughout the body. "
                    "The significance of a value depends on the "
                    "reference range, age, sex, and clinical context."
                )
            else:
                response = (
                    "I could not find a hemoglobin value in this "
                    "CBC analysis."
                )

        elif "platelet" in message:

            platelets = analysis.analysis.get("platelets")

            if platelets is not None:
                response = (
                    f"Your platelet value is {platelets}. "
                    "Platelets help with blood clotting. "
                    "The clinical significance depends on the "
                    "laboratory reference range and your overall "
                    "clinical context."
                )
            else:
                response = (
                    "I could not find a platelet value in this "
                    "CBC analysis."
                )

        elif "summary" in message or "overall" in message:

            response = str(analysis.summary)

        else:

            response = (
                "I can help explain the CBC information associated "
                "with this report. You can ask about values such as "
                "hemoglobin, platelets, WBC, RBC, or ask for an "
                "overall summary."
            )

        return {
            "response": response
        }

    # --------------------------------------------------
    # 5. No report selected
    # --------------------------------------------------
    return {
        "response": (
            "Please select a CBC report first so I can answer "
            "questions about your report."
        )
    }
