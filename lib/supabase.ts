import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, anon)
  : null;

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "site_survey"
  | "approved"
  | "rejected"
  | "completed";

export type ApplicationType =
  | "new_connection"
  | "load_extension"
  | "name_change"
  | "tariff_change"
  | "meter_shifting";

export type Application = {
  id: string;
  tracking_id: string;
  application_type: ApplicationType;
  applicant_name: string;
  father_or_husband: string | null;
  nid: string;
  mobile: string;
  email: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  tariff: string;
  phase: string;
  requested_load_kw: number;
  existing_account_no: string | null;
  status: ApplicationStatus;
  remarks: string | null;
  created_at: string;
};

export const TYPE_LABEL: Record<ApplicationType, string> = {
  new_connection: "নতুন সংযোগ",
  load_extension: "লোড বৃদ্ধি",
  name_change: "নাম পরিবর্তন",
  tariff_change: "ট্যারিফ পরিবর্তন",
  meter_shifting: "মিটার স্থানান্তর"
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "দাখিলকৃত",
  under_review: "পর্যালোচনাধীন",
  site_survey: "সাইট সার্ভে",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
  completed: "সম্পন্ন"
};

export function makeTrackingId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `NESCO-F41-${n}`;
}
