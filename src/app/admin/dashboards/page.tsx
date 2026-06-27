import Link from "next/link";
import { Mark } from "@/components/brand";
import { listDashboards } from "@/lib/analytics/dashboardStore";

export const dynamic = "force-dynamic";

export default async function DashboardsListPage() {
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
            Saved dashboards · <span className="hi">डैशबोर्ड</span>
          </span>
        </div>
        <div className="ctx">
          <Link href="/admin" className="titlechip" style={{ textDecoration: "none" }}>
            ← Analytics
          </Link>
        </div>
      </header>

      <main className="dash-list">
        {dashboards.length === 0 ? (
          <p className="dash-empty">
            No dashboards yet. Build one from the{" "}
            <Link href="/admin" className="hi" style={{ color: "var(--teal)" }}>
              analytics chat
            </Link>
            .
          </p>
        ) : (
          <div className="dash-list-grid">
            {dashboards.map((d) => (
              <Link key={d.id} href={`/admin/dashboards/${d.id}`} className="dash-card">
                <h3>{d.name}</h3>
                <span className="dash-card-meta">
                  {d.chartCount} chart{d.chartCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
