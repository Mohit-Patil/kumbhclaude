import Link from "next/link";
import { notFound } from "next/navigation";
import { Mark } from "@/components/brand";
import { getDashboard } from "@/lib/analytics/dashboardStore";
import { ChartRenderer } from "@/components/admin/ChartRenderer";

export const dynamic = "force-dynamic";

export default async function DashboardViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashboard = await getDashboard(id);
  if (!dashboard) notFound();

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
          <span className="titlechip">{dashboard.name}</span>
        </div>
        <div className="ctx">
          <Link href="/admin/dashboards" className="titlechip" style={{ textDecoration: "none" }}>
            ← All dashboards
          </Link>
        </div>
      </header>

      <main className="dash-grid">
        {dashboard.charts.length === 0 ? (
          <p className="dash-empty">This dashboard has no charts.</p>
        ) : (
          dashboard.charts.map((c, i) => (
            <div className="dash-cell" key={i}>
              <ChartRenderer spec={c} />
            </div>
          ))
        )}
      </main>
    </div>
  );
}
