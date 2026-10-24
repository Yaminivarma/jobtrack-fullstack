from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

DB_PATH = Path(__file__).with_name("jobtrack.db")
VALID_STATUSES = {"Applied", "Interview", "Offer", "Rejected"}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                role TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Applied',
                applied_date TEXT NOT NULL,
                job_url TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

def row_to_dict(row):
    return dict(row)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "JobTrack API is running"})

@app.get("/api/applications")
def list_applications():
    status = request.args.get("status", "").strip()
    search = request.args.get("search", "").strip()
    query = "SELECT * FROM applications WHERE 1=1"
    params = []
    if status and status in VALID_STATUSES:
        query += " AND status = ?"
        params.append(status)
    if search:
        query += " AND (company LIKE ? OR role LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    query += " ORDER BY applied_date DESC, id DESC"
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return jsonify([row_to_dict(row) for row in rows])

@app.post("/api/applications")
def create_application():
    data = request.get_json(silent=True) or {}
    company = str(data.get("company", "")).strip()
    role = str(data.get("role", "")).strip()
    status = str(data.get("status", "Applied")).strip()
    applied_date = str(data.get("applied_date", "")).strip()
    job_url = str(data.get("job_url", "")).strip()
    notes = str(data.get("notes", "")).strip()

    if not company or not role or not applied_date:
        return jsonify({"error": "Company, role, and applied date are required."}), 400
    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid application status."}), 400

    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO applications
               (company, role, status, applied_date, job_url, notes)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (company, role, status, applied_date, job_url, notes)
        )
        row = conn.execute("SELECT * FROM applications WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify(row_to_dict(row)), 201

@app.put("/api/applications/<int:application_id>")
def update_application(application_id):
    data = request.get_json(silent=True) or {}
    company = str(data.get("company", "")).strip()
    role = str(data.get("role", "")).strip()
    status = str(data.get("status", "Applied")).strip()
    applied_date = str(data.get("applied_date", "")).strip()
    job_url = str(data.get("job_url", "")).strip()
    notes = str(data.get("notes", "")).strip()

    if not company or not role or not applied_date:
        return jsonify({"error": "Company, role, and applied date are required."}), 400
    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid application status."}), 400

    with get_db() as conn:
        existing = conn.execute("SELECT id FROM applications WHERE id = ?", (application_id,)).fetchone()
        if not existing:
            return jsonify({"error": "Application not found."}), 404
        conn.execute(
            """UPDATE applications
               SET company=?, role=?, status=?, applied_date=?, job_url=?, notes=?
               WHERE id=?""",
            (company, role, status, applied_date, job_url, notes, application_id)
        )
        row = conn.execute("SELECT * FROM applications WHERE id = ?", (application_id,)).fetchone()
    return jsonify(row_to_dict(row))

@app.delete("/api/applications/<int:application_id>")
def delete_application(application_id):
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM applications WHERE id = ?", (application_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Application not found."}), 404
    return jsonify({"message": "Application deleted successfully."})

@app.get("/api/stats")
def stats():
    with get_db() as conn:
        total = conn.execute("SELECT COUNT(*) FROM applications").fetchone()[0]
        rows = conn.execute(
            "SELECT status, COUNT(*) AS count FROM applications GROUP BY status"
        ).fetchall()
    counts = {status: 0 for status in VALID_STATUSES}
    counts.update({row["status"]: row["count"] for row in rows})
    return jsonify({"total": total, "by_status": counts})

init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
