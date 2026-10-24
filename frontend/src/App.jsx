import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Search, Pencil, Trash2, ExternalLink, X, LayoutDashboard, RefreshCw } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];
const emptyForm = () => ({
  company: "", role: "", status: "Applied",
  applied_date: new Date().toISOString().slice(0, 10),
  job_url: "", notes: ""
});

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

function App() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, by_status: {} });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filter !== "All") params.set("status", filter);
      const [apps, summary] = await Promise.all([
        apiRequest(`/applications?${params.toString()}`),
        apiRequest("/stats")
      ]);
      setApplications(apps);
      setStats(summary);
    } catch (err) {
      setError(`${err.message} Check that the Flask backend is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  };

  const openEdit = (app) => {
    setEditing(app.id);
    setForm({
      company: app.company, role: app.role, status: app.status,
      applied_date: app.applied_date, job_url: app.job_url || "", notes: app.notes || ""
    });
    setError("");
    setModalOpen(true);
  };

  const updateField = (event) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveApplication = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiRequest(editing ? `/applications/${editing}` : "/applications", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form)
      });
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteApplication = async (app) => {
    if (!window.confirm(`Delete the application for ${app.role} at ${app.company}?`)) return;
    try {
      await apiRequest(`/applications/${app.id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusClass = (status) => status.toLowerCase();
  const visibleStats = useMemo(() => [
    { label: "Total applications", value: stats.total || 0, className: "total" },
    { label: "Interviews", value: stats.by_status?.Interview || 0, className: "interview" },
    { label: "Offers", value: stats.by_status?.Offer || 0, className: "offer" },
    { label: "Rejected", value: stats.by_status?.Rejected || 0, className: "rejected" }
  ], [stats]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon"><BriefcaseBusiness size={21} /></span><span>JobTrack</span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><LayoutDashboard size={18} /> Dashboard</div>
        <div className="sidebar-tip">
          <div className="tip-icon">✦</div>
          <strong>One step at a time.</strong>
          <p>Keep every application organised and focus on your next opportunity.</p>
        </div>
        <div className="sidebar-footer">Your career, organised.</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Dashboard</div>
          <div className="profile"><span className="avatar">JT</span><span>Job Seeker</span></div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR CAREER OVERVIEW</p>
            <h1>Job applications</h1>
            <p className="subheading">Keep track of every opportunity, all in one place.</p>
          </div>
          <button className="primary-btn" onClick={openAdd}><Plus size={18} /> Add application</button>
        </section>

        <section className="stats-grid">
          {visibleStats.map(item => (
            <div className="stat-card" key={item.label}>
              <div className={`stat-symbol ${item.className}`}>
                {item.className === "total" ? <BriefcaseBusiness size={19} /> :
                 item.className === "interview" ? <span>↗</span> :
                 item.className === "offer" ? <span>✓</span> : <span>—</span>}
              </div>
              <div><p>{item.label}</p><strong>{item.value}</strong></div>
            </div>
          ))}
        </section>

        <section className="list-panel">
          <div className="list-heading">
            <div><h2>Application tracker</h2><p>Review and update your job search progress.</p></div>
            <button className="icon-btn refresh" title="Refresh applications" onClick={loadData}><RefreshCw size={17} /></button>
          </div>
          <div className="toolbar">
            <div className="search-box"><Search size={17} /><input aria-label="Search applications" placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value)}>
              <option>All</option>{STATUSES.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>

          {error && !modalOpen && <div className="error-banner">{error}</div>}
          {loading ? <div className="empty-state"><div className="loader" /><p>Loading applications...</p></div> :
            applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><BriefcaseBusiness size={25} /></div>
                <h3>No applications found</h3>
                <p>{search || filter !== "All" ? "Try changing your search or filter." : "Add your first job application to get started."}</p>
                {!search && filter === "All" && <button className="secondary-btn" onClick={openAdd}><Plus size={16} /> Add your first application</button>}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>COMPANY / ROLE</th><th>DATE APPLIED</th><th>STATUS</th><th>JOB LINK</th><th>ACTIONS</th></tr></thead>
                  <tbody>{applications.map(app => (
                    <tr key={app.id}>
                      <td><div className="company-cell"><span className="company-avatar">{app.company.slice(0, 1).toUpperCase()}</span><div><strong>{app.company}</strong><small>{app.role}</small></div></div></td>
                      <td>{new Date(`${app.applied_date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td><span className={`status-pill ${statusClass(app.status)}`}><span />{app.status}</span></td>
                      <td>{app.job_url ? <a className="job-link" href={app.job_url} target="_blank" rel="noreferrer">View job <ExternalLink size={13} /></a> : <span className="muted">—</span>}</td>
                      <td><div className="actions"><button className="icon-btn" title="Edit application" onClick={() => openEdit(app)}><Pencil size={16} /></button><button className="icon-btn delete-btn" title="Delete application" onClick={() => deleteApplication(app)}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          <div className="panel-footer">Showing {applications.length} application{applications.length === 1 ? "" : "s"} <span>Data is saved in your local database.</span></div>
        </section>
        <footer className="page-footer">Built with React, Flask & SQLite <span>JobTrack · Portfolio Project</span></footer>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading"><div><h2 id="modal-title">{editing ? "Edit application" : "Add application"}</h2><p>Enter the details for this opportunity.</p></div><button className="icon-btn" aria-label="Close dialog" onClick={() => setModalOpen(false)}><X size={20} /></button></div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={saveApplication}>
              <div className="form-grid">
                <label>Company name *<input name="company" value={form.company} onChange={updateField} placeholder="e.g. Acme Technologies" required maxLength={100} /></label>
                <label>Job title *<input name="role" value={form.role} onChange={updateField} placeholder="e.g. Junior Full Stack Developer" required maxLength={100} /></label>
                <label>Status<select name="status" value={form.status} onChange={updateField}>{STATUSES.map(status => <option key={status}>{status}</option>)}</select></label>
                <label>Date applied *<input type="date" name="applied_date" value={form.applied_date} onChange={updateField} required /></label>
                <label className="full-width">Job posting URL<input type="url" name="job_url" value={form.job_url} onChange={updateField} placeholder="https://..." /></label>
                <label className="full-width">Notes<textarea name="notes" value={form.notes} onChange={updateField} placeholder="Recruiter details, interview date, follow-up reminders..." rows="3" maxLength={2000} /></label>
              </div>
              <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-btn" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add application"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
