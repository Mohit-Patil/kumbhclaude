import Link from "next/link";
import { Mark, Silhouette } from "@/components/brand";
import { getDashboardData, type QueueItem, type MatchCard } from "@/lib/queries";

export const dynamic = "force-dynamic";

function MergeNode() {
  return (
    <div className="merge">
      <div className="node">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A574B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 4v6a5 5 0 005 5 5 5 0 005-5V4" />
          <path d="M12 15v5" />
        </svg>
      </div>
    </div>
  );
}

function QCard({ kind, item }: { kind: "miss" | "found"; item: QueueItem }) {
  return (
    <div className={`qcard ${kind}`}>
      <div className="ph av-silhouette">
        <Silhouette size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="nm">{item.name}</div>
        <div className="mt">{item.meta}</div>
      </div>
      <div className="ago">{item.ago}</div>
    </div>
  );
}

function MatchBig({ m }: { m: MatchCard }) {
  const pct = Math.round(m.confidence * 100);
  const hi = m.confidence >= 0.8;
  const methodLabel =
    m.method === "aadhaar" ? "Aadhaar match" : m.method === "phone" ? "Phone match" : "Face + attributes";
  return (
    <div className="matchbig">
      <div className="pair">
        <div className="pp">
          <div className="ph av-silhouette">
            <Silhouette size={28} />
          </div>
          <div className="nm">{m.missingName}</div>
          <div className="mt">
            <span className="chip missing" style={{ padding: "3px 9px", fontSize: 10.5 }}>
              <span className="dot" />
              Missing
            </span>
            <br />
            {m.missingMeta}
          </div>
        </div>
        <MergeNode />
        <div className="pp">
          <div className="ph av-silhouette">
            <Silhouette size={28} />
          </div>
          <div className="nm">{m.foundName}</div>
          <div className="mt">
            <span className="chip found" style={{ padding: "3px 9px", fontSize: 10.5 }}>
              <span className="dot" />
              Found
            </span>
            <br />
            {m.foundMeta}
          </div>
        </div>
      </div>
      <div className="confwrap">
        <div className={`meter ${hi ? "hi" : "mid"}`}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="confline">
          <span>{methodLabel}</span>
          <span className={`pct ${hi ? "hi" : "mid"}`}>{pct}% confidence</span>
        </div>
      </div>
      <div className="macts">
        <button className="btn btn-primary btn-sm grow">
          Confirm reunion <span className="sub">पुष्टि करें</span>
        </button>
        <button className="btn btn-ghost btn-sm">Not a match</button>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const { stats, missingQueue, foundQueue, matches, reunited } = await getDashboardData();

  return (
    <div className="dash">
      <header className="band">
        <div className="left">
          <Link href="/" className="brand" aria-label="Punarmilan home">
            <Mark size={36} />
            <div className="name">
              पुनर्मिलन<small>Punarmilan</small>
            </div>
          </Link>
          <span className="titlechip">
            Control room · <span className="hi">मिलान केंद्र</span>
          </span>
        </div>
        <div className="ctx">
          <div className="cell">
            <div className="k">Coverage</div>
            <div className="v mono">Sectors 1–25 · live data</div>
          </div>
          <div className="cell">
            <div className="k">Source</div>
            <div className="v mono">Supabase · ap-south-1</div>
          </div>
          <div className="duty">
            <div className="cell" style={{ textAlign: "right" }}>
              <div className="k">Supervisor</div>
              <div className="v">R. Verma</div>
            </div>
            <div className="av">RV</div>
          </div>
        </div>
      </header>

      <div className="stats">
        <div className="stat miss">
          <div className="n">{stats.openMissing}</div>
          <div className="k">Open <b>missing</b> right now</div>
        </div>
        <div className="stat found">
          <div className="n">{stats.openFound}</div>
          <div className="k">Found, <b>awaiting</b> a match</div>
        </div>
        <div className="stat matched">
          <div className="n">{stats.candidates}</div>
          <div className="k">Candidate <b>matches</b> to confirm</div>
        </div>
        <div className="stat reunited">
          <div className="n">{stats.reunitedToday}</div>
          <div className="k"><b>Reunited</b> today</div>
        </div>
      </div>

      <div className="board">
        {/* LEFT: missing queue */}
        <div className="col">
          <div className="colhead">
            <span className="sw" style={{ background: "var(--vermilion)" }} />
            Missing · open <span className="ct">{missingQueue.length}</span>
          </div>
          {missingQueue.map((it) => (
            <QCard key={it.id} kind="miss" item={it} />
          ))}
          {missingQueue.length === 0 && <div className="hint">No open missing reports.</div>}
        </div>

        {/* CENTER: confluence + matches */}
        <div className="mcol">
          <div className="confluence">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path d="M8 4 C 18 16, 20 18, 20 26" stroke="#F6C16B" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M32 4 C 22 16, 20 18, 20 26" stroke="#F4A8A0" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M20 26 L20 37" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
            <div>
              <h2>Candidate matches</h2>
              <p>
                Where a missing report and a found report meet ·{" "}
                {matches.length} pair{matches.length === 1 ? "" : "s"} awaiting confirmation
              </p>
            </div>
          </div>

          {matches.map((m) => (
            <MatchBig key={m.id} m={m} />
          ))}
          {matches.length === 0 && (
            <div className="matchbig">
              <div className="hint" style={{ textAlign: "center", padding: "8px 0" }}>
                No candidate matches right now.
              </div>
            </div>
          )}

          <div className="reunited">
            <h3>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A574B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Reunited today <span className="hi" style={{ fontWeight: 500, color: "var(--teal)" }}>आज के पुनर्मिलन</span>
            </h3>
            <div className="rfeed">
              {reunited.map((r) => (
                <div className="rrow" key={r.id}>
                  <span className="chip reunited" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                    <span className="dot" />
                  </span>
                  <span className="nm">{r.name}</span>
                  <span style={{ color: "var(--ink-faint)" }}>→ {r.via}</span>
                  <span className="tm">{r.ago} ago</span>
                </div>
              ))}
              {reunited.length === 0 && <div className="hint">No reunions logged yet today.</div>}
            </div>
          </div>
        </div>

        {/* RIGHT: found queue */}
        <div className="col">
          <div className="colhead">
            <span className="sw" style={{ background: "var(--marigold)" }} />
            Found · open <span className="ct">{foundQueue.length}</span>
          </div>
          {foundQueue.map((it) => (
            <QCard key={it.id} kind="found" item={it} />
          ))}
          {foundQueue.length === 0 && <div className="hint">No open found reports.</div>}
        </div>
      </div>
    </div>
  );
}
