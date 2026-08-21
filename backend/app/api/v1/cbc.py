from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.oauth2 import get_current_user
from app.models.user import User

from app.services.pdf_service import PDFService
from app.services.cbc_service import CBCService
from app.services.cbc_interpretation_service import CBCInterpretationService
from app.services.cbc_summary_service import CBCSummaryService

from app.repositories.report_repository import ReportRepository
from app.repositories.cbc_analysis_repository import CBCAnalysisRepository


router = APIRouter(
    prefix="/cbc",
    tags=["CBC Analysis"],
)


@router.post("/analyze")
def analyze_cbc(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # --------------------------------------------------
        # 1. Validate uploaded file
        # --------------------------------------------------
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed.",
            )

        # --------------------------------------------------
        # 2. Save uploaded PDF
        # --------------------------------------------------
        file_path = f"uploads/{file.filename}"

        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        # --------------------------------------------------
        # 3. Create report record
        # --------------------------------------------------
        report = ReportRepository.create_report(
            db=db,
            user_id=current_user.id,
            file_name=file.filename,
            file_path=file_path,
        )

        # --------------------------------------------------
        # 4. Extract text from PDF
        # --------------------------------------------------
        text = PDFService.extract_text(file_path)

        # --------------------------------------------------
        # 5. Parse CBC values
        # --------------------------------------------------
        cbc_data = CBCService.parse_cbc(text)

        if not cbc_data:
            raise HTTPException(
                status_code=400,
                detail="Could not detect CBC parameters in the uploaded PDF.",
            )

        # --------------------------------------------------
        # 6. Interpret CBC values
        # --------------------------------------------------
        analysis = CBCInterpretationService.interpret(cbc_data)

        # --------------------------------------------------
        # 7. Generate summary
        # --------------------------------------------------
        summary = CBCSummaryService.generate_summary(analysis)

        # --------------------------------------------------
        # 8. Save analysis + summary in database
        # --------------------------------------------------
        CBCAnalysisRepository.create_analysis(
            db=db,
            report_id=report.id,
            analysis=analysis,
            summary=summary,
        )

        # --------------------------------------------------
        # 9. Update report status
        # --------------------------------------------------
        report.status = "Analyzed"
        db.commit()
        db.refresh(report)

        # --------------------------------------------------
        # 10. Return complete result
        # --------------------------------------------------
        return {
            "report_id": report.id,
            "file_name": report.file_name,
            "status": report.status,
            "analysis": analysis,
            "summary": summary,
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get("/reports/{report_id}")
def get_cbc_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # 1. Check whether report belongs to current user
    # --------------------------------------------------
    report = ReportRepository.get_report_by_id(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    # --------------------------------------------------
    # 2. Get CBC analysis
    # --------------------------------------------------
    analysis = CBCAnalysisRepository.get_analysis_by_report(
        db=db,
        report_id=report_id,
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="CBC analysis not found.",
        )

    # --------------------------------------------------
    # 3. Return saved CBC result
    # --------------------------------------------------
    return {
        "report_id": report.id,
        "file_name": report.file_name,
        "status": report.status,
        "uploaded_at": report.uploaded_at,
        "analysis": analysis.analysis,
        "summary": analysis.summary,
        "analyzed_at": analysis.analyzed_at,
    }
