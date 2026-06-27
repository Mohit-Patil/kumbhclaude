import FoundFlow from "./flow";
import { getCandidateMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kiosk?: string }>;
}) {
  const sp = await searchParams;
  const matches = await getCandidateMatches();
  return <FoundFlow kiosk={sp?.kiosk === "1"} matches={matches} />;
}
