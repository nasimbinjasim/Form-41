"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Application,
  ApplicationStatus,
  STATUS_LABEL,
  TYPE_LABEL
} from "@/lib/supabase";

const STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "site_survey",
  "approved",
  "rejected",
  "completed"
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Application[]>([]);
  const [busyId, setBusyId] = useState("");

  async function load() {
    const res = await fetch("/api/admin/applications");
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Load failed");
      setLoading(false);
      return;
    }
    setRows(json.applications || []);
    setAuthed(true);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Login failed");
      setLoading(false);
      return;
    }
    setPassword("");
    await load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setRows([]);
  }

  async function updateStatus(row: Application, status: ApplicationStatus) {
    setBusyId(row.id);
    setError("");
    const res = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status })
    });
    const json = await res.json();
    if (!res.ok) setError(json.error || "Update failed");
    else setRows((list) => list.map((r) => (r.id === row.id ? { ...r, status } : r)));
    setBusyId("");
  }

  return (
    <>
      <header>
        <div className="brand">
          <div className="logo">N</div>
          <div>
            <h1>Form-41 এডমিন</h1>
            <p>বাণিজ্যিক পরিচালন — আবেদন তালিকা ও স্ট্যাটাস</p>
          </div>
        </div>
      </header>
      <main>
        {!authed ? (
          <form onSubmit={login} style={{ maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>এডমিন লগইন</h2>
            <label>পাসওয়ার্ড</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="primary" disabled={loading}>{loading ? "..." : "ঢুকুন"}</button>
            {error && <div className="notice error">{error}</div>}
          </form>
        ) : (
          <>
            <div className="hero" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <span className="badge">এডমিন</span>
                <h2 style={{ margin: "6px 0 0" }}>মোট আবেদন: {rows.length}</h2>
              </div>
              <div>
                <button className="primary" type="button" onClick={() => load()}>রিফ্রেশ</button>{" "}
                <button className="primary" type="button" onClick={logout} style={{ background: "#5b3a32" }}>লগআউট</button>
              </div>
            </div>
            {error && <div className="notice error">{error}</div>}
            <div className="card" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #d7d0c4" }}>
                    <th style={{ padding: "8px 6px" }}>ট্র্যাকিং</th>
                    <th style={{ padding: "8px 6px" }}>আবেদনকারী</th>
                    <th style={{ padding: "8px 6px" }}>ধরন</th>
                    <th style={{ padding: "8px 6px" }}>এলাকা</th>
                    <th style={{ padding: "8px 6px" }}>যোগাযোগ</th>
                    <th style={{ padding: "8px 6px" }}>স্ট্যাটাস</th>
                    <th style={{ padding: "8px 6px" }}>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>{row.tracking_id}</td>
                      <td style={{ padding: "8px 6px" }}><b>{row.applicant_name}</b><div style={{ color: "#667" }}>{row.nid}</div></td>
                      <td style={{ padding: "8px 6px" }}>{TYPE_LABEL[row.application_type] || row.application_type}</td>
                      <td style={{ padding: "8px 6px" }}>{row.upazila}, {row.district}<div style={{ color: "#667" }}>{row.requested_load_kw} kW · {row.phase}</div></td>
                      <td style={{ padding: "8px 6px" }}>{row.mobile}<div style={{ color: "#667" }}>{row.email}</div></td>
                      <td style={{ padding: "8px 6px" }}>
                        <select value={row.status} disabled={busyId === row.id} onChange={(e) => updateStatus(row, e.target.value as ApplicationStatus)}>
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>{new Date(row.created_at).toLocaleString("bn-BD")}</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr><td colSpan={7} style={{ padding: 16, color: "#667" }}>এখনো কোনো আবেদন নেই।</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}
