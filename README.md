# 🏥 MediAssist AI

> An AI-powered healthcare assistant for analyzing medical reports, understanding blood test results, and providing intelligent health insights.

## 📌 Overview

MediAssist AI is a full-stack AI-powered healthcare application designed to help users better understand their medical reports and health information.

The application combines **OCR, Machine Learning, Deep Learning, and Generative AI** to analyze medical documents and provide easy-to-understand explanations.

It provides a centralized platform where users can upload medical reports, extract relevant information, analyze blood reports, and interact with an AI-powered health assistant.

---

## ✨ Features

- 📄 **Medical Report Upload**
  - Upload medical reports in PDF format.

- 🔬 **CBC Report Analysis**
  - Extract and analyze important Complete Blood Count (CBC) parameters.

- 📝 **OCR-based Medical Data Extraction**
  - Extract text and medical information from uploaded reports using OCR.

- 🩸 **Blood Smear Image Analysis**
  - Analyze blood smear images using Deep Learning.

- 🤖 **AI Health Assistant**
  - Ask health-related questions and receive AI-generated explanations.

- 🧠 **Disease Risk Prediction**
  - Predict potential disease risks based on available medical information.

- 📊 **Medical Report Explanation**
  - Convert complex medical terminology and report values into simpler explanations.

- 📑 **PDF Report Generation**
  - Generate structured PDF reports from the analyzed information.

---

## 🏗️ System Architecture

```text
                     ┌─────────────────────┐
                     │      User           │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Next.js Frontend  │
                     │   TypeScript        │
                     └──────────┬──────────┘
                                │
                         REST API Requests
                                │
                                ▼
                     ┌─────────────────────┐
                     │   FastAPI Backend   │
                     │      Python         │
                     └──────────┬──────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
       ┌───────────┐      ┌───────────┐     ┌─────────────┐
       │    OCR    │      │    AI/ML   │     │ PostgreSQL  │
       │ Processing│      │  Models    │     │  Database   │
       └───────────┘      └───────────┘     └─────────────┘
             │                  │
             └──────────────────┼──────────────────┐
                                ▼                  │
                         ┌──────────────┐          │
                         │ AI Health    │◄─────────┘
                         │ Assistant    │
                         └──────────────┘
🛠️ Tech Stack
Frontend
Next.js
TypeScript
React
Tailwind CSS
Backend
Python
FastAPI
Pydantic
Uvicorn
Database
PostgreSQL
SQLAlchemy
AI / Machine Learning
PyTorch
Machine Learning models
Deep Learning
Generative AI
OCR & Document Processing
EasyOCR / PaddleOCR
PyPDF
Authentication & Security
JWT Authentication
Password Hashing
Environment-based configuration
Deployment
GitHub
Render

📂 Project Structure

MediAssist-AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── .env
│   └── venv/
│
├── docs/
│
├── README.md
├── requirements.txt
└── .gitignore


⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/harshitadeheri/MediAssist-AI.git
cd MediAssist-AI
2. Create a virtual environment
cd backend

python -m venv venv

Activate the environment:

macOS / Linux
source venv/bin/activate
Windows
venv\Scripts\activate
3. Install dependencies
pip install -r requirements.txt
4. Configure environment variables

Create a .env file inside the backend directory.

DATABASE_URL=your_database_url
APP_NAME=MediAssist AI
APP_VERSION=1.0.0
DEBUG=False
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

Never commit your .env file or expose secret keys publicly.

5. Run the backend
uvicorn app.main:app --reload

The API will be available at:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs
🔐 Authentication

MediAssist AI uses JWT-based authentication.

The authentication flow includes:

User registration
Password hashing
User login
JWT access token generation
Protected API endpoints
Token expiration
📊 Medical Report Processing

The medical report processing pipeline follows these steps:

Upload Medical Report
        ↓
PDF / Image Processing
        ↓
OCR Text Extraction
        ↓
Medical Data Extraction
        ↓
Report Analysis
        ↓
AI-based Explanation
        ↓
User-friendly Results
🧠 AI Pipeline

The AI components are designed to support:

Medical report interpretation
Blood report analysis
Disease risk prediction
Blood smear image classification
AI-generated health explanations

The system is designed as a decision-support and educational tool and is not intended to replace professional medical diagnosis.

🚀 Deployment

The backend is configured for deployment using Render.

The deployment process is:

GitHub Repository
       ↓
Render
       ↓
FastAPI Application
       ↓
PostgreSQL Database

Every update pushed to the main branch can trigger a new deployment.

🔮 Future Enhancements
Doctor recommendation system
More disease prediction models
Advanced medical image classification
Personalized health dashboard
Medical history tracking
Improved AI conversational capabilities
More comprehensive report analysis
Mobile application
Cloud-based ML inference
👩‍💻 Author

Harshita Deheri

B.Tech Computer Science & Engineering
National Institute of Technology, Rourkela

GitHub:
https://github.com/harshitadeheri

⚠️ Disclaimer

MediAssist AI is developed for educational and research purposes.

The information generated by the system should not be considered a medical diagnosis or a substitute for consultation with a qualified healthcare professional.
