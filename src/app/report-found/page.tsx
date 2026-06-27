import { AgentBand, Silhouette } from "@/components/brand";

function Pin({ color = "#C97D00" }: { color?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" fill={color} />
      <circle cx="12" cy="10" r="3" fill="#fff" />
    </svg>
  );
}

export default function ReportFound() {
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
            Children reported missing who match this description, closest first.
          </p>

          <div className="match-card">
            <div className="ph av-silhouette">
              <Silhouette size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="nm">Aarti Yadav · 7</div>
              <div className="mt">Father waiting at Booth K-08 · last seen 25 min ago, Akhara Marg</div>
              <div className="meter hi">
                <i style={{ width: "88%" }} />
              </div>
              <div className="confline">
                <span>Similarity</span>
                <span className="pct hi">88% match</span>
              </div>
              <div className="methods">
                <span className="mtag">Face</span>
                <span className="mtag">Clothing</span>
                <span className="mtag">Name</span>
              </div>
            </div>
          </div>

          <div className="match-card">
            <div className="ph av-silhouette">
              <Silhouette size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="nm">Unnamed girl · ~6</div>
              <div className="mt">Reported by grandmother · last seen 1 hr ago, Ram Ghat</div>
              <div className="meter mid">
                <i style={{ width: "54%" }} />
              </div>
              <div className="confline">
                <span>Similarity</span>
                <span className="pct mid">54% match</span>
              </div>
              <div className="methods">
                <span className="mtag">Age range</span>
                <span className="mtag">Clothing</span>
              </div>
            </div>
          </div>

          <a className="chip ghost" style={{ justifyContent: "center" }} href="/dashboard">
            Open full match board →
          </a>
        </aside>
      </div>
    </div>
  );
}
