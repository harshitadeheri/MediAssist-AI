from app.database.database import Base, engine

# Import every model here
from app.models.user import User
from app.models.report import Report

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Done! All tables created successfully.")