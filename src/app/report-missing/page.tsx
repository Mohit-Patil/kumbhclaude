import { AgentBand } from "@/components/brand";
import { Avatar } from "@/components/avatar";
import { getCandidateMatches } from "@/lib/queries";
import ReportForm from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportMissing() {
  const matches = await getCandidateMatches();

  return (
    <div className="agent">
      <AgentBand title="Report missing" titleHi="गुमशुदा" />

      <div className="work">
        <ReportForm />

        <aside className="card panel">
          <div className="ph2">
            Possible matches <span className="hi">संभावित मिलान</span>
          </div>
          <p className="sub">
            Live found-person candidates from the match engine, ranked by similarity.
          </p>

          {matches.map((m) => {
            const pct = Math.round(m.confidence * 100);
            const hi = m.confidence >= 0.8;
            const method = m.method === "aadhaar" ? "Aadhaar" : m.method === "phone" ? "Phone" : "Description";
            return (
              <div className="match-card" key={m.id}>
                <div className="ph av-silhouette">
                  <Avatar url={m.foundPhoto} size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="nm">{m.foundName}</div>
                  <div className="mt">{m.foundMeta} · paired with {m.missingName}</div>
                  <div className={`meter ${hi ? "hi" : "mid"}`}>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <div className="confline">
                    <span>Similarity</span>
                    <span className={`pct ${hi ? "hi" : "mid"}`}>{pct}% match</span>
                  </div>
                  <div className="methods">
                    <span className="mtag">{method}</span>
                    <span className="mtag">Age range</span>
                  </div>
                </div>
              </div>
            );
          })}
          {matches.length === 0 && (
            <p className="hint">No candidate matches in the system yet.</p>
          )}

          <a className="chip ghost" style={{ justifyContent: "center" }} href="/dashboard">
            Open full match board →
          </a>
        </aside>
      </div>
    </div>
  );
}
