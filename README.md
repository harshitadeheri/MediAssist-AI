# 🏥 MediAssist AI

> An AI-powered healthcare assistant for analyzing medical reports, extracting
> laboratory information, providing health explanations, and assisting users
> through an intelligent medical chatbot.

MediAssist AI is a full-stack healthcare application designed to help users
understand their medical reports and laboratory results through AI-assisted
analysis.

The system combines a modern web frontend, a FastAPI backend, PostgreSQL
database, OCR/PDF processing, and AI-based healthcare assistance in a single
platform.

---

## 🚀 Live Backend

**Backend API:**  
https://mediassist-backend-l8jj.onrender.com

**API Documentation (Swagger):**  
https://mediassist-backend-l8jj.onrender.com/docs

> The backend is deployed on Render. The frontend deployment is currently
> under development.

---

## ✨ Features

### 🔐 User Authentication

- User registration
- User login
- JWT-based authentication
- Protected API endpoints
- Secure password hashing

### 🩸 CBC Report Analysis

- Upload CBC/medical reports
- Extract relevant laboratory values
- Analyze CBC parameters
- Generate understandable health-related explanations
- Store report analysis results

### 📄 Medical Report Processing

- PDF report upload
- PDF text extraction
- Medical report processing
- Structured storage of report information

### 🔎 OCR Support

- Extract information from medical reports
- Process medical report data for further analysis

### 🤖 AI Health Assistant

- AI-powered healthcare chatbot
- Conversational interaction
- Health-related explanations
- Context-aware assistance

### 🧠 AI / Deep Learning

- AI-assisted medical analysis
- Disease risk/prediction functionality
- Deep-learning based components for healthcare analysis

### 📊 Report Management

- Store user reports
- Retrieve report information
- Associate reports with authenticated users

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │      Next.js        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌─────────────┐
       │ PostgreSQL │   │ AI / ML    │   │ PDF / OCR   │
       │  Database  │   │ Services   │   │ Processing  │
       └────────────┘   └────────────┘   └─────────────┘
🛠️ Tech Stack
Layer	Technology
Frontend	Next.js, TypeScript
Backend	FastAPI, Python
API Server	Uvicorn
Database	PostgreSQL
ORM	SQLAlchemy
Authentication	JWT, Passlib, bcrypt
Validation	Pydantic
PDF Processing	PyPDF
OCR	EasyOCR / PaddleOCR
AI / ML	PyTorch
Deployment	Render
📁 Project Structure
MediAssist-AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── reports.py
│   │   │       ├── cbc.py
│   │   │       ├── chatbot.py
│   │   │       └── prediction.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── oauth2.py
│   │   │   └── security.py
│   │   │
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   ├── dependencies.py
│   │   │   └── create_tables.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── report.py
│   │   │   └── cbc_analysis.py
│   │   │
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── docs/
│
├── .gitignore
└── README.md
🔌 API Endpoints

The backend exposes REST APIs using FastAPI.

Authentication
POST /auth/register
POST /auth/login
Users
GET /users/me
Medical Reports
POST /reports/upload

Additional CBC, chatbot, and prediction functionality is exposed through
the corresponding API modules.

Interactive API documentation is available at:

https://mediassist-backend-l8jj.onrender.com/docs

⚙️ Local Setup
1. Clone the repository
git clone https://github.com/harshitadeheri/MediAssist-AI.git
cd MediAssist-AI
2. Backend Setup
cd backend

python -m venv venv
source venv/bin/activate

For Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt
3. Configure Environment Variables

Create a .env file inside the backend directory.

APP_NAME=MediAssist AI
APP_VERSION=1.0.0
DEBUG=True

DATABASE_URL=your_postgresql_database_url

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

Do not commit .env files or API keys to GitHub.

4. Run the Backend
uvicorn app.main:app --reload --port 8000

The API will be available at:

http://localhost:8000

Swagger documentation:

http://localhost:8000/docs
5. Run the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend will be available at:

http://localhost:3000
🔄 Application Flow
User
  │
  ▼
Next.js Frontend
  │
  │ REST API
  ▼
FastAPI Backend
  │
  ├── Authentication
  │       │
  │       ▼
  │    JWT Token
  │
  ├── Medical Report Upload
  │       │
  │       ▼
  │    PDF / OCR Processing
  │
  ├── CBC Analysis
  │       │
  │       ▼
  │    AI / ML Analysis
  │
  ├── Chatbot
  │       │
  │       ▼
  │    Health Explanation
  │
  └── PostgreSQL
          │
          ▼
      Store Results
🔒 Security

The application includes:

JWT-based authentication
Password hashing
Protected API endpoints
Environment-based configuration
CORS configuration
Separation of frontend and backend
Secrets stored outside the source code
☁️ Deployment

The FastAPI backend is deployed using Render.

GitHub Repository
       │
       ▼
    Render
       │
       ▼
 FastAPI + Uvicorn
       │
       ▼
 PostgreSQL

Backend:

https://mediassist-backend-l8jj.onrender.com

API documentation:

https://mediassist-backend-l8jj.onrender.com/docs

🧪 Testing

The backend can be tested through the automatically generated FastAPI
Swagger documentation.

Main testing flow:

Register
   ↓
Login
   ↓
Obtain JWT token
   ↓
Authorize
   ↓
Access protected endpoints
   ↓
Upload medical report
   ↓
Analyze report
   ↓
Retrieve results
⚠️ Medical Disclaimer

MediAssist AI is an educational and assistive software project.

It is not a replacement for a qualified healthcare professional and
should not be used as the sole basis for medical diagnosis or treatment.

Users should consult qualified healthcare professionals for medical advice,
diagnosis, and treatment decisions.

👩‍💻 Author

Harshita Deheri

Computer Science Engineering

GitHub:
https://github.com/harshitadeheri

⭐ Project Highlights
Full-stack healthcare application
RESTful API architecture
FastAPI backend
PostgreSQL database
JWT authentication
Medical PDF processing
OCR integration
CBC analysis
AI-powered chatbot
AI/ML-assisted healthcare analysis
Cloud deployment
Interactive Swagger API documentation
