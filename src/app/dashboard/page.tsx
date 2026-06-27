import Link from "next/link";
import { Mark, Silhouette } from "@/components/brand";

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

function QCard({
  kind,
  name,
  meta,
  ago,
}: {
  kind: "miss" | "found";
  name: string;
  meta: string;
  ago: string;
}) {
  return (
    <div className={`qcard ${kind}`}>
      <div className="ph av-silhouette">
        <Silhouette size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="nm">{name}</div>
        <div className="mt">{meta}</div>
      </div>
      <div className="ago">{ago}</div>
    </div>
  );
}

export default function Dashboard() {
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
            <div className="v mono">Sectors 1–25 · 84 booths</div>
          </div>
          <div className="cell">
            <div className="k">Live</div>
            <div className="v mono">14:08 · Day 6</div>
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
          <div className="n">23</div>
          <div className="k">Open <b>missing</b> right now</div>
        </div>
        <div className="stat found">
          <div className="n">17</div>
          <div className="k">Found, <b>awaiting</b> a match</div>
        </div>
        <div className="stat matched">
          <div className="n">8</div>
          <div className="k">Candidate <b>matches</b> to confirm</div>
        </div>
        <div className="stat reunited">
          <div className="n">142</div>
          <div className="k"><b>Reunited</b> today</div>
        </div>
      </div>

      <div className="board">
        {/* LEFT: missing queue */}
        <div className="col">
          <div className="colhead">
            <span className="sw" style={{ background: "var(--vermilion)" }} />
            Missing · open <span className="ct">23</span>
          </div>
          <QCard kind="miss" name="Aarti Yadav · 7" meta="Akhara Marg · red frock" ago="25m" />
          <QCard kind="miss" name="Ramesh Patel · 68" meta="Sector 4 · disoriented, white kurta" ago="38m" />
          <QCard kind="miss" name="Unnamed boy · ~5" meta="Sangam ghat · blue shirt" ago="52m" />
          <QCard kind="miss" name="Lakshmi Bai · 74" meta="Sector 12 · green saree" ago="1h 10m" />
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
              <p>Where a missing report and a found report meet · 8 pairs awaiting confirmation</p>
            </div>
          </div>

          <div className="matchbig">
            <div className="pair">
              <div className="pp">
                <div className="ph av-silhouette">
                  <Silhouette size={28} />
                </div>
                <div className="nm">Aarti Yadav · 7</div>
                <div className="mt">
                  <span className="chip missing" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                    <span className="dot" />Missing
                  </span>
                  <br />Father at K-08
                </div>
              </div>
              <MergeNode />
              <div className="pp">
                <div className="ph av-silhouette">
                  <Silhouette size={28} />
                </div>
                <div className="nm">Unidentified · ~7</div>
                <div className="mt">
                  <span className="chip found" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                    <span className="dot" />Found
                  </span>
                  <br />Safe at K-14
                </div>
              </div>
            </div>
            <div className="confwrap">
              <div className="meter hi">
                <i style={{ width: "88%" }} />
              </div>
              <div className="confline">
                <span>Face · clothing · name spoken</span>
                <span className="pct hi">88% confidence</span>
              </div>
            </div>
            <div className="macts">
              <button className="btn btn-primary btn-sm grow">
                Confirm reunion <span className="sub">पुष्टि करें</span>
              </button>
              <button className="btn btn-ghost btn-sm">Not a match</button>
            </div>
          </div>

          <div className="matchbig">
            <div className="pair">
              <div className="pp">
                <div className="ph av-silhouette">
                  <Silhouette size={28} />
                </div>
                <div className="nm">Ramesh Patel · 68</div>
                <div className="mt">
                  <span className="chip missing" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                    <span className="dot" />Missing
                  </span>
                  <br />Son at K-31
                </div>
              </div>
              <MergeNode />
              <div className="pp">
                <div className="ph av-silhouette">
                  <Silhouette size={28} />
                </div>
                <div className="nm">Elderly man · 65–70</div>
                <div className="mt">
                  <span className="chip found" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                    <span className="dot" />Found
                  </span>
                  <br />Medical tent M-3
                </div>
              </div>
            </div>
            <div className="confwrap">
              <div className="meter mid">
                <i style={{ width: "63%" }} />
              </div>
              <div className="confline">
                <span>Face · age range · sector</span>
                <span className="pct mid">63% confidence</span>
              </div>
            </div>
            <div className="macts">
              <button className="btn btn-primary btn-sm grow">
                Confirm reunion <span className="sub">पुष्टि करें</span>
              </button>
              <button className="btn btn-ghost btn-sm">Not a match</button>
            </div>
          </div>

          <div className="reunited">
            <h3>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A574B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Reunited today <span className="hi" style={{ fontWeight: 500, color: "var(--teal)" }}>आज के पुनर्मिलन</span>
            </h3>
            <div className="rfeed">
              <div className="rrow">
                <span className="chip reunited" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                  <span className="dot" />
                </span>
                <span className="nm">Pooja Sahni · 6</span>
                <span style={{ color: "var(--ink-faint)" }}>→ mother, Booth K-02</span>
                <span className="tm">4 min ago</span>
              </div>
              <div className="rrow">
                <span className="chip reunited" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                  <span className="dot" />
                </span>
                <span className="nm">Mohan Lal · 71</span>
                <span style={{ color: "var(--ink-faint)" }}>→ grandson, Sector 6</span>
                <span className="tm">19 min ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: found queue */}
        <div className="col">
          <div className="colhead">
            <span className="sw" style={{ background: "var(--marigold)" }} />
            Found · open <span className="ct">17</span>
          </div>
          <QCard kind="found" name="Unidentified · ~7" meta="Booth K-14 · red frock, crying" ago="12m" />
          <QCard kind="found" name="Elderly man · 65–70" meta="Medical tent M-3 · white kurta" ago="20m" />
          <QCard kind="found" name="Boy · 4–6" meta="Booth K-21 · blue shirt, no shoes" ago="44m" />
          <QCard kind="found" name="Woman · ~70" meta="Sector 9 · green saree, confused" ago="1h" />
        </div>
      </div>
    </div>
  );
}
