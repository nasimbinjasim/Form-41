# Form-41 — NESCO Online Application

বাণিজ্যিক পরিচালন, নেসকো — অনলাইন আবেদন ব্যবস্থাপনা।

Stack: **GitHub `nasimbinjasim/Form-41` → Vercel `form-41` → Supabase**

Notifications are **email**, not SMS.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Run `sql/schema.sql` in the Supabase SQL editor.
3. In Vercel project `form-41` set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `npm install && npm run dev`
