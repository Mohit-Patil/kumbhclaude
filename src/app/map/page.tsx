import Link from "next/link";
import { Mark } from "@/components/brand";
import { getMapReports } from "@/lib/queries";
import { OperatorMap } from "@/components/map/OperatorMap";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { missing, found } = await getMapReports();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="map-page">
      <header className="band">
        <div className="left">
          <Link href="/" className="brand" aria-label="Punarmilan home">
            <Mark size={36} />
            <div className="name">
              पुनर्मिलन<small>Punarmilan</small>
            </div>
          </Link>
          <span className="titlechip">
            Search map · <span className="hi">खोज नक्शा</span>
          </span>
        </div>
        <div className="ctx">
          <div className="cell">
            <div className="k">On map</div>
            <div className="v mono">
              {missing.length} missing · {found.length} found
            </div>
          </div>
          <Link href="/dashboard" className="titlechip" style={{ textDecoration: "none" }}>
            ← Control room
          </Link>
        </div>
      </header>

      <OperatorMap missing={missing} found={found} apiKey={apiKey} />
    </div>
  );
}
