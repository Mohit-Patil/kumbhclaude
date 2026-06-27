import { AgentBand } from "@/components/brand";
import { Avatar } from "@/components/avatar";
import { getCandidateMatches } from "@/lib/queries";
import LocationField from "./LocationField";
import { fileMissingReport } from "./actions";
import { PhotoCapture } from "@/components/photo-capture";

export const dynamic = "force-dynamic";

export default async function ReportMissing() {
  const matches = await getCandidateMatches();

  return (
    <div className="agent">
      <AgentBand title="Report missing" titleHi="गुमशुदा" />

      <div className="work">
        <form className="card formcard" action={fileMissingReport}>
          <div className="fhead">
            <div>
              <div className="eyebrow">Missing person report</div>
              <h1 className="title">
                Who has been separated?
                <span className="hi">कौन बिछड़ा है?</span>
              </h1>
            </div>
            <span className="chip missing">
              <span className="dot" />
              Active search
            </span>
          </div>

          <div className="sec">
            <div className="with-photo">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>
                    Name <span className="hi">नाम</span>
                    <span className="req">*</span>
                  </label>
                  <input className="input" name="name" defaultValue="Aarti Yadav" />
                </div>
                <div className="grid2">
                  <div className="field">
                    <label>
                      Age <span className="hi">उम्र</span>
                    </label>
                    <input className="input" name="age" defaultValue="7 years" />
                  </div>
                  <div className="field">
                    <label>
                      Gender <span className="hi">लिंग</span>
                    </label>
                    <input className="input" name="gender" defaultValue="Girl" />
                  </div>
                </div>
                <div className="field">
                  <label>
                    What were they wearing? <span className="hi">पहनावा</span>
                    <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    name="wearing"
                    defaultValue="Red frock, yellow hairband, silver anklets"
                  />
                </div>
              </div>
              <div className="field">
                <label>
                  Photo <span className="opt">If any</span>
                </label>
                <PhotoCapture fieldName="photo" className="photo-big" />
              </div>
            </div>
          </div>

          <div className="sec bt">
            <div className="eyebrow">Last seen</div>
            <div className="grid2">
              <div className="field">
                <label>
                  Between <span className="hi">समय</span>
                </label>
                <div className="grid2">
                  <input className="input mono" name="lastSeenFrom" defaultValue="13:30" />
                  <input className="input mono" name="lastSeenTo" defaultValue="13:50" />
                </div>
                <span className="hint">Approximate window is fine.</span>
              </div>
              <LocationField />
            </div>
          </div>

          <div className="sec bt">
            <div className="eyebrow">Reported by — parent / guardian</div>
            <div className="grid3">
              <div className="field">
                <label>
                  Name <span className="req">*</span>
                </label>
                <input className="input" name="reporterName" defaultValue="Suresh Yadav" />
              </div>
              <div className="field">
                <label>
                  Mobile <span className="req">*</span>
                </label>
                <input className="input mono" name="reporterMobile" defaultValue="+91 98270 …" />
              </div>
              <div className="field">
                <label>Relation</label>
                <input className="input" name="relation" defaultValue="Father" />
              </div>
            </div>
            <div className="secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2l8 4v6c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-4z" fill="#0E7C6B" />
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              We&rsquo;ll call this number the moment a matching found-report comes in.
            </div>
          </div>

          <div className="factions">
            <button type="submit" className="btn btn-danger grow btn-lg">
              File missing report <span className="sub">सूचना दर्ज करें</span>
            </button>
            <button type="button" className="btn btn-ghost">Save draft</button>
          </div>
        </form>

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
