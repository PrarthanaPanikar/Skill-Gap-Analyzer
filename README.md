**SkillGap AI — Resume & Career Readiness Analyzer**

SkillGap AI is an AI-assisted career-readiness application that helps users compare their resume with a target job role, identify skill gaps, improve their resume, discover relevant project ideas, and create a personalized learning roadmap.
Project status: Development / prototype. Configure Firebase, database access, and an AI provider before running the full workflow. Test the complete authentication and analysis flow before using it in production.

**Features**
- Google sign-in: Firebase Authentication integration.
- Career target setup: Select a target role and up to five dream companies.
- Resume upload: Accepts PDF and DOCX files, with a configurable upload limit.
- ATS-style scoring: A custom score with category-level feedback. This is not a score from any specific employer's ATS.
- Skill-gap analysis: Compares resume skills against starter role profiles and highlights strong, weak, and missing skills.
- Project recommendations: AI-generated project ideas intended to help address skill gaps.
- Learning roadmap: Creates a structured learning plan; the backend is configured to automatically generate one when skill match is below a threshold, or when requested.
- Saved analysis: Backend database models support user profiles and analysis records.


**Tech stack**
- Frontend: React, TypeScript, Vite, React Router
- Authentication: Firebase Authentication (Google provider)
- Backend: Python, FastAPI, Uvicorn
- Database: SQLAlchemy; SQLite can be used for local development, and PostgreSQL is supported
- Resume parsing: pdfplumber, python-docx
- AI providers: Anthropic or OpenAI, configured through environment variables
Repository structure
The original skillgap-module archive provides an additive frontend module and a FastAPI backend. If you have integrated it into a Vite application, your local project may look similar to this:


skillgap-module/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── data/
│   │   ├── services/
│   │   ├── main.py
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── db.py
│   │   └── routes.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── frontend/                 # Original additive frontend module
├── skillgap-web/             # Vite app, if created during integration
│   ├── public/
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md

Prerequisites
Install:
- Python 3.10 or later (a version compatible with the installed dependencies)
- Node.js and npm (use a current LTS version)
- A Firebase project with a registered Web app
- An Anthropic or OpenAI API key to enable live AI-generated guidance
- PostgreSQL only if you choose PostgreSQL instead of SQLite
Configuration
1. Backend
Open a terminal in the repository root, then run:
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
Edit backend/.env. The example settings include:
DATABASE_URL=sqlite:///./skillgap.db
FIREBASE_CREDENTIALS=serviceAccount.json
AI_PROVIDER=anthropic
MODEL_NAME=claude-sonnet-5-5
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
CORS_ORIGINS=http://localhost:5173
R

OADMAP_THRESHOLD=50
- SQLite is the simplest option for local development. The backend configuration defaults to SQLite; the example environment file may specify PostgreSQL, so explicitly set the database URL you intend to use.
- For PostgreSQL, use a valid connection URL and ensure the database exists and is reachable.
- Set AI_PROVIDER to anthropic or openai and provide the matching API key.
- Configure Firebase Admin credentials as required by the backend. If using a service-account JSON file, place it where FIREBASE_CREDENTIALS points.
- Keep credentials out of source control.
Start the API from the backend directory:
uvicorn app.main:app --reload
API base URL: http://localhost:8000/api
Interactive API documentation: http://localhost:8000/docs

2. Firebase Authentication
1. Open the Firebase Console and select your project.
2. Register a Firebase Web app and copy its configuration.
3. In Authentication → Sign-in method, enable Google.
4. Add localhost to Authorized domains for local development.
5. Add your deployed app domain when deploying.
6. Configure the backend Firebase Admin credential separately from the frontend configuration.
Do not commit Firebase service-account JSON files. Frontend Firebase configuration is not a substitute for backend token verification.
3. Frontend
Use the folder containing the actual Vite package.json. If your integrated frontend is in skillgap-web, run:
cd skillgap-web
npm install
Create the frontend environment file from the example if present:
Copy-Item .env.example .env
Set the real Firebase Web SDK values in skillgap-web/.env:
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
The variable names must match those read by the frontend code. Never put Firebase Admin credentials or private API keys in a VITE_ variable.
Start the frontend:
npm run dev
Vite will print the local URL, commonly http://localhost:5173.
If you have not integrated the additive frontend/src files into a complete Vite app, complete that integration first. The original archive's frontend is a module, not a standalone package with its own package.json.

Typical user workflow
1. Sign in with Google.
2. Choose a target role and dream companies.
3. Upload a PDF or DOCX resume.
4. Review the ATS-style score and resume feedback.
5. Review strong, weak, and missing skills.
6. Explore suggested projects.
7. Generate or follow a personalized learning roadmap.
Development checks
Backend smoke test (run from the backend directory, with the virtual environment activated):
$env:PYTHONPATH = "."
python tests/smoke_test.py
Frontend production build (run from the Vite frontend directory):
npm run build
Security notes
- Never commit .env, serviceAccount.json, private keys, database credentials, or API keys.
- Keep .env.example limited to placeholder values.
- Validate uploads on the server and configure appropriate size limits.
- Protect API routes by verifying Firebase ID tokens server-side.
- Use HTTPS and appropriate security controls before deployment.
- A Firebase Authentication setup is not itself a network firewall or a Web Application Firewall.
- Do not use real user resumes or sensitive data in public test environments.
Limitations
- ATS scoring is a custom estimate and does not represent any employer's proprietary ATS.
- Role skill profiles are starter data and may not reflect every job description.
- Company-specific guidance is only as reliable as the job requirements provided to the application; do not assume it is based on live company vacancies unless such an integration is implemented.
- AI-generated recommendations can be inaccurate and should be reviewed.
- OCR for scanned/image-only resumes may not be supported.
- Configure and test all external services before relying on the complete workflow.
Contributing
1. Create a feature branch.
2. Keep credentials and personal data out of commits.
3. Run the backend smoke test and frontend build.
4. Open a pull request describing the change and how it was tested