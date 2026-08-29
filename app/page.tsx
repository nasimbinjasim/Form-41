"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Application,
  ApplicationType,
  STATUS_LABEL,
  TYPE_LABEL,
  makeTrackingId,
  supabase,
  supabaseConfigured
} from "@/lib/supabase";

const emptyForm = {
  application_type: "new_connection" as ApplicationType,
  applicant_name: "",
  father_or_husband: "",
  nid: "",
  mobile: "",
  email: "",
  division: "Rajshahi",
  district: "",
  upazila: "",
  address: "",
  tariff: "LT-A Residential",
  phase: "1-phase",
  requested_load_kw: "2",
  existing_account_no: ""
};

export default function Home() {
  const [mode, setMode] = useState<"apply" | "track">("apply");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState("");
  const [mobileHint, setMobileHint] = useState("");
  const [result, setResult] = useState<Application | null>(null);

  const configured = useMemo(() => supabaseConfigured && supabase, []);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setResult(null);
    if (!supabase) {
      setError("Supabase configured nai. .env.local e URL o ANON KEY din.");
      return;
    }
    setLoading(true);
    const tracking_id = makeTrackingId();
    const payload = {
      tracking_id,
      application_type: form.application_type,
      applicant_name: form.applicant_name.trim(),
      father_or_husband: form.father_or_husband.trim() || null,
      nid: form.nid.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      division: form.division,
      district: form.district.trim(),
      upazila: form.upazila.trim(),
      address: form.address.trim(),
      tariff: form.tariff,
      phase: form.phase,
      requested_load_kw: Number(form.requested_load_kw || 0),
      existing_account_no: form.existing_account_no.trim() || null,
      status: "submitted"
    };
    const { data, error: err } = await supabase.from("applications").insert(payload).select().single();
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    await supabase.from("application_status_history").insert({
      application_id: data.id,
      status: "submitted",
      note: "Online application submitted"
    });
    await supabase.from("notification_log").insert({
      application_id: data.id,
      channel: "email",
      recipient: form.email,
      subject: `NESCO Form-41 — ${tracking_id}`,
      body: `Application received. Tracking: ${tracking_id}`
    });
    setResult(data as Application);
    setMessage(`Application accepted. Tracking: ${tracking_id}`);
    setForm(emptyForm);
    setLoading(false);
  }

  async function track(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setResult(null);
    if (!supabase) {
      setError("Supabase configured nai.");
      return;
    }
    setLoading(true);
    let q = supabase.from("applications").select("*").eq("tracking_id", tracking.trim());
    if (mobileHint.trim()) q = q.eq("mobile", mobileHint.trim());
    const { data, error: err } = await q.maybeSingle();
    if (err) setError(err.message);
    else if (!data) setError("No application found.");
    else setResult(data as Application);
    setLoading(false);
  }

  return (
    <>
      <header>
        <div className="brand">
          <div className="logo">N</div>
          <div>
            <h1>নর্দান ইলেকট্রিসিটি সাপ্লাই কোম্পানি লিমিটেড</h1>
            <p>বাণিজ্যিক পরিচালন — Form-41 অনলাইন আবেদন ব্যবস্থাপনা</p>
          </div>
        </div>
      </header>
      <main>
        <section className="hero">
          <span className="badge">অনলাইন সেবা</span>
          <h2 style={{ margin: "6px 0 8px" }}>নতুন সংযোগ ও সংশ্লিষ্ট আবেদন</h2>
          <p style={{ margin: 0 }}>আবেদন জমা দিন এবং ট্র্যাকিং নম্বর দিয়ে অবস্থা দেখুন। বিজ্ঞপ্তি SMS-এর পরিবর্তে ই-মেইলে যাবে।</p>
        </section>
        <div className="tabs">
          <button className={mode === "apply" ? "active" : ""} onClick={() => setMode("apply")}>আবেদন করুন</button>
          <button className={mode === "track" ? "active" : ""} onClick={() => setMode("track")}>আবেদন ট্র্যাক করুন</button>
        </div>
        {mode === "apply" ? (
          <form onSubmit={submit}>
            <div className="grid">
              <div><label>আবেদনের ধরন</label>
                <select value={form.application_type} onChange={(e) => update("application_type", e.target.value)}>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div><label>আবেদনকারীর নাম *</label><input required value={form.applicant_name} onChange={(e) => update("applicant_name", e.target.value)} /></div>
              <div><label>পিতা / স্বামী</label><input value={form.father_or_husband} onChange={(e) => update("father_or_husband", e.target.value)} /></div>
              <div><label>জাতীয় পরিচয়পত্র *</label><input required value={form.nid} onChange={(e) => update("nid", e.target.value)} /></div>
              <div><label>মোবাইল *</label><input required value={form.mobile} onChange={(e) => update("mobile", e.target.value)} /></div>
              <div><label>ই-মেইল *</label><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div><label>বিভাগ</label>
                <select value={form.division} onChange={(e) => update("division", e.target.value)}>
                  <option>Rajshahi</option><option>Rangpur</option>
                </select></div>
              <div><label>জেলা *</label><input required value={form.district} onChange={(e) => update("district", e.target.value)} /></div>
              <div><label>উপজেলা / থানা *</label><input required value={form.upazila} onChange={(e) => update("upazila", e.target.value)} /></div>
              <div><label>ট্যারিফ</label>
                <select value={form.tariff} onChange={(e) => update("tariff", e.target.value)}>
                  <option>LT-A Residential</option><option>LT-B Agricultural</option><option>LT-C Small Industry</option>
                  <option>LT-D Charitable</option><option>LT-E Commercial</option><option>MT Commercial / Industry</option>
                </select></div>
              <div><label>ফেজ</label>
                <select value={form.phase} onChange={(e) => update("phase", e.target.value)}>
                  <option>1-phase</option><option>3-phase</option>
                </select></div>
              <div><label>প্রস্তাবিত লোড (kW)</label>
                <input type="number" min="0.1" step="0.1" value={form.requested_load_kw} onChange={(e) => update("requested_load_kw", e.target.value)} /></div>
              <div><label>বিদ্যমান একাউন্ট নম্বর</label><input value={form.existing_account_no} onChange={(e) => update("existing_account_no", e.target.value)} /></div>
              <div className="full"><label>সংযোগের ঠিকানা *</label><textarea required value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
            </div>
            <button className="primary" disabled={loading}>{loading ? "..." : "আবেদন জমা দিন"}</button>
          </form>
        ) : (
          <form onSubmit={track}>
            <div className="grid">
              <div><label>ট্র্যাকিং নম্বর *</label><input required value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="NESCO-F41-xxxxxx" /></div>
              <div><label>মোবাইল</label><input value={mobileHint} onChange={(e) => setMobileHint(e.target.value)} /></div>
            </div>
            <button className="primary" disabled={loading}>{loading ? "..." : "স্ট্যাটাস দেখুন"}</button>
          </form>
        )}
        {message && <div className="notice">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        {result && (
          <div className="card track-result">
            <h3 style={{ marginTop: 0 }}>আবেদনের তথ্য</h3>
            <div className="kv">
              <b>ট্র্যাকিং</b><span>{result.tracking_id}</span>
              <b>ধরন</b><span>{TYPE_LABEL[result.application_type] || result.application_type}</span>
              <b>আবেদনকারী</b><span>{result.applicant_name}</span>
              <b>মোবাইল</b><span>{result.mobile}</span>
              <b>ই-মেইল</b><span>{result.email}</span>
              <b>এলাকা</b><span>{result.upazila}, {result.district}</span>
              <b>লোড / ফেজ</b><span>{result.requested_load_kw} kW · {result.phase} · {result.tariff}</span>
              <b>অবস্থা</b><span>{STATUS_LABEL[result.status] || result.status}</span>
              <b>দাখিল</b><span>{new Date(result.created_at).toLocaleString("bn-BD")}</span>
            </div>
          </div>
        )}
      </main>
      <footer>Form-41 · NESCO Commercial Operations</footer>
    </>
  );
}
