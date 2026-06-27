"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function parseCoord(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function parseAge(v: FormDataEntryValue | null): number | null {
  const m = String(v ?? "").match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/**
 * Files a new missing-person report. The last-seen coordinates (from the
 * location dropdown or the dropped Google-map pin) are written to the
 * PostGIS `report_location` geography column as EWKT `POINT(lon lat)`.
 */
export async function fileMissingReport(formData: FormData) {
  const fullName = String(formData.get("name") ?? "").trim() || null;
  const age = parseAge(formData.get("age"));
  const description = String(formData.get("wearing") ?? "").trim() || null;

  const lat = parseCoord(formData.get("lastSeenLat"));
  const lon = parseCoord(formData.get("lastSeenLon"));
  if (lat == null || lon == null) {
    throw new Error(
      "Choose a location from the list or drop a pin on the map before filing the report.",
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Create the subject person record.
  const { data: person, error: personError } = await supabaseAdmin
    .from("person")
    .insert({ full_name: fullName, age, description })
    .select("person_id")
    .single();
  if (personError) {
    throw new Error(`Could not save person: ${personError.message}`);
  }

  // 2. Resolve the booth by its code (hardcoded to K-14 for now).
  const { data: booth, error: boothError } = await supabaseAdmin
    .from("booth")
    .select("booth_id")
    .eq("code", "K-14")
    .single();
  if (boothError) {
    throw new Error(`Could not find booth K-14: ${boothError.message}`);
  }

  // 3. Create the missing report with the PostGIS location.
  // geography expects lon-then-lat ordering inside POINT(...).
  const reportLocation = `SRID=4326;POINT(${lon} ${lat})`;
  const { error: reportError } = await supabaseAdmin.from("missing_report").insert({
    subject_person_id: person.person_id,
    booth_id: booth.booth_id,
    report_location: reportLocation,
    status: "open",
  });
  if (reportError) {
    throw new Error(`Could not file missing report: ${reportError.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/report-missing");
  redirect("/dashboard");
}
