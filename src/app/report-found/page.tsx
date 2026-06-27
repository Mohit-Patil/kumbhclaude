import { AgentBand, Silhouette } from "@/components/brand";
import { getCandidateMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

function Pin({ color = "#C97D00" }: { color?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" fill={color} />
      <circle cx="12" cy="10" r="3" fill="#fff" />
    </svg>
  );
}

export default async function ReportFound() {
  const matches = await getCandidateMatches();

  return (
    <div className="agent">
      <AgentBand title="Report found" titleHi="मिला व्यक्ति" />

      <div className="work">
        <div className="card formcard">
          <div className="fhead">
            <div>
              <div className="eyebrow">Found person report</div>
              <h1 className="title">
                Who did you find?
                <span className="hi">यह कौन है?</span>
              </h1>
            </div>
            <span className="chip found">
              <span className="dot" />
              Safe at booth
            </span>
          </div>

          <div className="sec">
            <div className="with-photo">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>
                    Name <span className="hi">नाम</span>
                    <span className="opt">If known</span>
                  </label>
                  <input className="input ph" defaultValue="Not known yet" />
                </div>
                <div className="grid2">
                  <div className="field">
                    <label>
                      Age range <span className="hi">अनुमानित उम्र</span>
                      <span className="req">*</span>
                    </label>
                    <input className="input" defaultValue="6 – 8 years" />
                  </div>
                  <div className="field">
                    <label>
                      Gender <span className="hi">लिंग</span>
                    </label>
                    <input className="input" defaultValue="Girl" />
                  </div>
                </div>
                <div className="field">
                  <label>
                    Appearance <span className="hi">पहनावा / पहचान</span>
                    <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    defaultValue="Red frock, one yellow hairband, crying, barefoot"
                  />
                </div>
              </div>
              <div className="field">
                <label>
                  Photo <span className="req">*</span>
                </label>
                <div className="shot photo-big done" style={{ borderColor: "var(--marigold)", background: "var(--marigold-tint)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C97D00" strokeWidth="2" aria-hidden>
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="lab" style={{ color: "var(--marigold-deep)" }}>
                    Photo<br />captured
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sec bt">
            <div className="eyebrow">Where & when found</div>
            <div className="grid2">
              <div className="field">
                <label>
                  Found at <span className="hi">समय</span>
                </label>
                <input className="input mono" defaultValue="13:56 · Day 6" />
                <span className="hint">Auto-filled to now — adjust if needed.</span>
              </div>
              <div className="field">
                <label>
                  Location <span className="hi">स्थान</span>
                </label>
                <div className="map">
                  <div className="pin">
                    <Pin />
                  </div>
                  <span className="lbl" style={{ color: "var(--marigold-deep)" }}>
                    Sector 9 gate · brought to Booth K-14
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sec bt">
            <div className="eyebrow">Anything they can tell you?</div>
            <div className="grid3">
              <div className="field">
                <label>
                  A name they say <span className="opt">Optional</span>
                </label>
                <input className="input ph" defaultValue="&ldquo;Aarti&rdquo;" />
              </div>
              <div className="field">
                <label>
                  Guardian&rsquo;s phone <span className="opt">Optional</span>
                </label>
                <input className="input mono ph" defaultValue="Doesn't know" />
              </div>
              <div className="field">
                <label>
                  Aadhaar <span className="opt">If on them</span>
                </label>
                <input className="input ph mono" defaultValue="—" />
              </div>
            </div>
          </div>

          <div className="factions">
            <button className="btn btn-found grow btn-lg">
              Log found person <span className="sub">दर्ज करें</span>
            </button>
            <button className="btn btn-ghost">Cancel</button>
          </div>
        </div>

        <aside className="card panel">
          <div className="ph2">
            Open missing reports <span className="hi">खुली सूचनाएँ</span>
          </div>
          <p className="sub">
            Live candidate matches — people reported missing who may be this person.
          </p>

          {matches.map((m) => {
            const pct = Math.round(m.confidence * 100);
            const hi = m.confidence >= 0.8;
            const method = m.method === "aadhaar" ? "Aadhaar" : m.method === "phone" ? "Phone" : "Description";
            return (
              <div className="match-card" key={m.id}>
                <div className="ph av-silhouette">
                  <Silhouette size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="nm">{m.missingName}</div>
                  <div className="mt">{m.missingMeta} · possible match to {m.foundName}</div>
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
            <p className="hint">No open missing reports to match yet.</p>
          )}

          <a className="chip ghost" style={{ justifyContent: "center" }} href="/dashboard">
            Open full match board →
          </a>
        </aside>
      </div>
    </div>
  );
}
