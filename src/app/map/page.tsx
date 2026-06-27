import Link from "next/link";
import { Brand } from "@/components/brand";
import { getMapReports, getBooths } from "@/lib/queries";
import { OperatorMap } from "@/components/map/OperatorMap";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [{ missing, found }, booths] = await Promise.all([getMapReports(), getBooths()]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="map-page">
      <header className="idband">
        <Brand size={40} />
        <div className="idband-where">
          <span className="dev">खोज नक्शा · {missing.length} गुमशुदा · {found.length} मिले · {booths.length} बूथ</span>
          <span className="en" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            Search map · {missing.length} missing · {found.length} found · {booths.length} booths
            <Link href="/dashboard" style={{ fontWeight: 700, color: "var(--candidate-ink)" }}>← Control room</Link>
          </span>
        </div>
      </header>

      <OperatorMap missing={missing} found={found} booths={booths} apiKey={apiKey} />
    </div>
  );
}
