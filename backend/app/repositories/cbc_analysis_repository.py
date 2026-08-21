from sqlalchemy.orm import Session

from app.models.cbc_analysis import CBCAnalysis


class CBCAnalysisRepository:

    @staticmethod
    def create_analysis(
        db: Session,
        report_id: int,
        analysis: dict,
        summary: dict,
    ):
        cbc_analysis = CBCAnalysis(
            report_id=report_id,
            analysis=analysis,
            summary=summary,
        )

        db.add(cbc_analysis)
        db.commit()
        db.refresh(cbc_analysis)

        return cbc_analysis

    @staticmethod
    def get_analysis_by_report(
        db: Session,
        report_id: int,
    ):
        return (
            db.query(CBCAnalysis)
            .filter(CBCAnalysis.report_id == report_id)
            .first()
        )
