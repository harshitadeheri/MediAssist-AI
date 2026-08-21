from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.oauth2 import get_current_user
from app.models.user import User
from app.repositories.report_repository import ReportRepository
from app.schemas.report import (
    ReportResponse,
    ReportDetailResponse,
)
from app.services.report_service import ReportService


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "/upload",
    response_model=ReportResponse,
)
def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return ReportService.upload_report(
            db=db,
            user_id=current_user.id,
            file=file,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[ReportResponse],
)
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ReportRepository.get_reports_by_user(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{report_id}",
    response_model=ReportDetailResponse,
)
def get_my_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = ReportRepository.get_report_by_id(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    return report
