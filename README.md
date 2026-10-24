# JobTrack — Job Application Management System

JobTrack is a full-stack portfolio project for tracking job applications, interview stages, offers, and rejections.

## Features
- Create, read, update, and delete job applications (CRUD)
- Search by company or role
- Filter by application status
- Dashboard counts for total applications, interviews, offers, and rejections
- Form validation and helpful API errors
- SQLite persistence
- Responsive React UI

## Tech stack
- Frontend: React, Vite, JavaScript, CSS
- Backend: Python, Flask, Flask-CORS
- Database: SQLite
- Version control: Git and GitHub

## Project structure
```text
jobtrack-fullstack/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── .gitignore
└── README.md
```

## Prerequisites
Install Python 3.10+, Node.js (LTS), and Git.

## Run the backend
Open a terminal in the project folder:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

**Windows (Command Prompt):**
```bat
.venv\Scripts\activate
```

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`. The SQLite database is created automatically the first time the app starts.

Test the API health endpoint at `http://127.0.0.1:5000/api/health`.

## Run the frontend
Open a **second terminal** in the project folder:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Keep both terminals running while using the app.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/applications` | List applications |
| GET | `/api/applications?search=developer` | Search company/role |
| GET | `/api/applications?status=Interview` | Filter by status |
| POST | `/api/applications` | Create application |
| PUT | `/api/applications/<id>` | Update application |
| DELETE | `/api/applications/<id>` | Delete application |
| GET | `/api/stats` | Dashboard statistics |

Example POST JSON:
```json
{
  "company": "Example Technologies",
  "role": "Junior Full Stack Developer",
  "status": "Applied",
  "applied_date": "2026-10-24",
  "job_url": "https://example.com/jobs/123",
  "notes": "Applied through company careers page"
}
```

## Troubleshooting
- **Frontend cannot connect:** make sure the Flask server is running on port 5000.
- **`python` not recognised:** install Python and enable “Add Python to PATH”, or try `py app.py` on Windows.
- **`npm` not recognised:** install Node.js LTS, then reopen your terminal.
- **Port already in use:** stop the other process using the port or update the relevant configuration.

## Upload to GitHub
1. Create a new, empty repository on GitHub named `jobtrack-fullstack`.
2. In a terminal, navigate to the project root (the folder containing this README).
3. Run:

```bash
git init
git add .
git commit -m "Initial commit: build JobTrack full-stack application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jobtrack-fullstack.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If Git asks you to authenticate, complete the browser sign-in or credential prompt. Never upload passwords, API keys, virtual environments, `node_modules`, or the generated SQLite database.

## Resume description
**JobTrack — Job Application Management System | React, Python Flask, SQLite, REST API**
- Developed a responsive full-stack application to manage and track job applications across Applied, Interview, Offer, and Rejected stages.
- Built REST APIs with Flask to support CRUD operations, search, status filtering, and dashboard statistics.
- Integrated React with a SQLite database for persistent storage and implemented client-side form validation and API error handling.
- Used Git/GitHub for source control and documented local setup and API endpoints.

Only list features you have personally run and can explain in an interview. Add screenshots and a deployed demo after you have tested the project end to end.
