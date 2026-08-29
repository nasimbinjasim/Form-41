import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createClient(url, key);
}

async function isAdmin() {
  const jar = await cookies();
  return jar.get("form41_admin")?.value === "1";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = client();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data || [] });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const status = String(body.status || "");
  const remarks = body.remarks == null ? undefined : String(body.remarks);
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const supabase = client();
  const patch: Record<string, string> = { status };
  if (remarks !== undefined) patch.remarks = remarks;

  const { data, error } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("application_status_history").insert({
    application_id: id,
    status,
    note: remarks || "Admin status update"
  });

  return NextResponse.json({ application: data });
}
