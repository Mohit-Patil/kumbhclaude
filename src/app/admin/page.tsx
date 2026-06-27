import Link from "next/link";
import { Mark } from "@/components/brand";
import { AnalyticsChat } from "@/components/admin/AnalyticsChat";
import { BuildDashboardBar } from "@/components/admin/BuildDashboardBar";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="admin-page">
      <header className="band">
        <div className="left">
          <Link href="/" className="brand" aria-label="Punarmilan home">
            <Mark size={36} />
            <div className="name">
              पुनर्मिलन<small>Punarmilan</small>
            </div>
          </Link>
          <span className="titlechip">
            Analytics · <span className="hi">विश्लेषण</span>
          </span>
        </div>
        <div className="ctx">
          <Link href="/admin/dashboards" className="titlechip" style={{ textDecoration: "none" }}>
            Saved dashboards
          </Link>
          <Link href="/dashboard" className="titlechip" style={{ textDecoration: "none" }}>
            ← Control room
          </Link>
        </div>
      </header>

      <BuildDashboardBar />
      <AnalyticsChat />
    </div>
  );
}
