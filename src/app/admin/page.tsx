import Link from "next/link";
import { Mark } from "@/components/brand";
import { AnalyticsChat } from "@/components/admin/AnalyticsChat";
import { BuildDashboardBar } from "@/components/admin/BuildDashboardBar";
import { listDashboards } from "@/lib/analytics/dashboardStore";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const dashboards = await listDashboards();

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

      {dashboards.length > 0 && (
        <div className="saved-strip">
          <span className="saved-strip-label">Saved dashboards</span>
          <div className="saved-strip-row">
            {dashboards.slice(0, 8).map((d) => (
              <Link key={d.id} href={`/admin/dashboards/${d.id}`} className="saved-card">
                <span className="saved-card-name">{d.name}</span>
                <span className="saved-card-meta">
                  {d.chartCount} chart{d.chartCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
            <Link href="/admin/dashboards" className="saved-card all">
              View all →
            </Link>
          </div>
        </div>
      )}

      <AnalyticsChat />
    </div>
  );
}
