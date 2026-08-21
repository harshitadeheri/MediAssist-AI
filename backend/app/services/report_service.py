from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.repositories.report_repository import ReportRepository


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class ReportService:

    @staticmethod
    def upload_report(
        db: Session,
        user_id: int,
        file: UploadFile,
    ):
        # Make sure the uploaded file is a PDF
        if file.content_type != "application/pdf":
            raise ValueError("Only PDF files are allowed")

        # Create a safe file name
        file_name = Path(file.filename or "report.pdf").name

        # Save location
        file_path = UPLOAD_DIR / file_name

        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                buffer.write(chunk)

        # Save metadata in database
        report = ReportRepository.create_report(
            db=db,
            user_id=user_id,
            file_name=file_name,
            file_path=str(file_path),
        )

        return report
