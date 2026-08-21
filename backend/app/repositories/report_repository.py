from sqlalchemy.orm import Session

from app.models.report import Report


class ReportRepository:

    @staticmethod
    def create_report(
        db: Session,
        user_id: int,
        file_name: str,
        file_path: str,
    ):
        report = Report(
            user_id=user_id,
            file_name=file_name,
            file_path=file_path,
            status="Uploaded",
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return report

    @staticmethod
    def get_reports_by_user(
        db: Session,
        user_id: int,
    ):
        return (
            db.query(Report)
            .filter(Report.user_id == user_id)
            .order_by(Report.uploaded_at.desc())
            .all()
        )

    @staticmethod
    def get_report_by_id(
        db: Session,
        report_id: int,
        user_id: int,
    ):
        return (
            db.query(Report)
            .filter(
                Report.id == report_id,
                Report.user_id == user_id,
            )
            .first()
        )