"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Result surfaced to the form via `useActionState` so the UI can confirm. */
export type FileReportState =
  | { ok: true; name: string }
  | { ok: false; error: string }
  | null;

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
 *
 * Returns a {@link FileReportState} instead of redirecting so the client form
 * can show a confirmation popup. Errors are returned (not thrown) so they land
 * in the same state object rather than tripping the error boundary.
 */
export async function fileMissingReport(
  _prevState: FileReportState,
  formData: FormData,
): Promise<FileReportState> {
  const fullName = String(formData.get("name") ?? "").trim() || null;
  const age = parseAge(formData.get("age"));
  const description = String(formData.get("wearing") ?? "").trim() || null;

  // Uploaded photo arrives as a data: URL from the PhotoCapture field. Stored
  // directly in photo.storage_ref, which the UI renders straight into <img src>.
  const photoRef = String(formData.get("photo") ?? "");
  const photo = photoRef.startsWith("data:image/") ? photoRef : null;

  const lat = parseCoord(formData.get("lastSeenLat"));
  const lon = parseCoord(formData.get("lastSeenLon"));
  if (lat == null || lon == null) {
    return {
      ok: false,
      error: "Choose a location from the list or drop a pin on the map before filing the report.",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Create the subject person record.
  const { data: person, error: personError } = await supabaseAdmin
    .from("person")
    .insert({ full_name: fullName, age, description })
    .select("person_id")
    .single();
  if (personError) {
    return { ok: false, error: `Could not save person: ${personError.message}` };
  }

  // 1b. Attach the uploaded photo to the person, if one was provided.
  if (photo) {
    const { error: photoError } = await supabaseAdmin.from("photo").insert({
      person_id: person.person_id,
      storage_ref: photo,
      kind: "selfie",
    });
    if (photoError) {
      throw new Error(`Could not save photo: ${photoError.message}`);
    }
  }

  // 2. Resolve the booth by its code (hardcoded to K-14 for now).
  const { data: booth, error: boothError } = await supabaseAdmin
    .from("booth")
    .select("booth_id")
    .eq("code", "K-14")
    .single();
  if (boothError) {
    return { ok: false, error: `Could not find booth K-14: ${boothError.message}` };
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
    return { ok: false, error: `Could not file missing report: ${reportError.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/report-missing");
  revalidatePath("/map");
  return { ok: true, name: fullName ?? "The missing person" };
}
