import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD এখনো সেট করা নেই।" },
      { status: 500 }
    );
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "পাসওয়ার্ড ভুল।" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("form41_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("form41_admin", "", { path: "/", maxAge: 0 });
  return res;
}
