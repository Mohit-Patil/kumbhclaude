import { BoothTop } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { getCandidateMatches } from "@/lib/queries";
import LocationField from "./LocationField";
import { fileMissingReport } from "./actions";

export const dynamic = "force-dynamic";

function FieldLabel({ dev, en, required, optional }: { dev: string; en: string; required?: boolean; optional?: boolean }) {
  return (
    <span className="field-label">
      <span className="field-label-text"><span className="dev">{dev}</span><span className="en">{en}</span></span>
      {required && <span className="req">●</span>}
      {optional && <span className="opt"><span className="dev">वैकल्पिक</span> Optional</span>}
    </span>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kiosk?: string }>;
}) {
  const sp = await searchParams;
  const kiosk = sp?.kiosk === "1";
  const matches = await getCandidateMatches();

  return (
    <div className="civic">
      <BoothTop kiosk={kiosk} titleDev="गुमशुदा की सूचना" titleEn="Report missing" />

      <main className="civic-main civic-wide civic-tight">
        <div className="civic-head">
          <h1><span className="dev">कौन बिछड़ गया है?</span><span className="en">Who has been separated?</span></h1>
          <p><span className="dev">जल्दबाज़ी ठीक है। फ़ोटो और आख़िरी जगह सबसे ज़रूरी हैं।</span> Take your time. A photo and the last-seen place matter most.</p>
        </div>

        <div className="work2">
          {/* LEFT — the form */}
          <form action={fileMissingReport} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="block">
              <div className="block-head"><span className="block-num">1</span><h2><span className="dev">व्यक्ति</span><span className="en">The person</span></h2></div>
              <div className="with-photo">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="field"><FieldLabel dev="नाम" en="Name" optional /><input className="input" name="name" placeholder="If known" defaultValue="Aarti Yadav" /></div>
                  <div className="two">
                    <div className="field"><FieldLabel dev="उम्र" en="Age" optional /><input className="input" name="age" placeholder="e.g. 7" defaultValue="7" /></div>
                    <div className="field"><FieldLabel dev="लिंग" en="Gender" optional /><input className="input" name="gender" defaultValue="Girl" /></div>
                  </div>
                  <div className="field"><FieldLabel dev="पहनावा / पहचान" en="What were they wearing?" /><input className="input" name="wearing" defaultValue="Red frock, yellow hairband, silver anklets" /></div>
                </div>
                <div className="field">
                  <FieldLabel dev="तस्वीर" en="Photo" />
                  <div className="photo">
                    <div className="photo-empty" style={{ cursor: "default" }}>
                      <span className="photo-ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.4" /></svg></span>
                      <span className="photo-lab"><span className="dev">बूथ पर फ़ोटो लें</span><span className="en">Capture at booth</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="block">
              <div className="block-head"><span className="block-num">2</span><h2><span className="dev">आख़िरी बार कहाँ व कब</span><span className="en">Last seen — where & when</span></h2></div>
              <LocationField />
              <div className="two">
                <div className="field"><FieldLabel dev="समय — से" en="Time — from" /><input className="input" name="lastSeenFrom" type="time" defaultValue="13:30" /></div>
                <div className="field"><FieldLabel dev="समय — तक" en="Time — to" /><input className="input" name="lastSeenTo" type="time" defaultValue="13:50" /></div>
              </div>
            </section>

            <section className="block">
              <div className="block-head"><span className="block-num">3</span><h2><span className="dev">आपका संपर्क</span><span className="en">Your contact (guardian)</span></h2></div>
              <div className="two">
                <div className="field"><FieldLabel dev="फ़ोन नंबर" en="Phone number" /><input className="input" name="reporterMobile" type="tel" inputMode="numeric" placeholder="+91 —" defaultValue="+91 98270 00000" /></div>
                <div className="field"><FieldLabel dev="आपका नाम" en="Your name" optional /><input className="input" name="reporterName" defaultValue="Suresh Yadav" /></div>
              </div>
              <div className="field"><FieldLabel dev="संबंध" en="Relation" optional /><input className="input" name="relation" defaultValue="Father" /></div>
            </section>

            <button type="submit" className="btn btn-missing btn-block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" /></svg>
              <span className="dev">सूचना दर्ज करें</span> File missing report
            </button>
          </form>

          {/* RIGHT — live matches (sticky, no extra scroll) */}
          <aside className="matches-aside">
            <section className="block">
              <div className="block-head"><h2><span className="dev">संभावित मिलान</span><span className="en">Possible matches</span></h2></div>
              <p className="hint"><span className="dev">अभी मिले लोगों से तुलना।</span> Live candidates — staff confirm before reuniting.</p>
              {matches.length === 0 ? (
                <p className="hint">No candidate matches yet.</p>
              ) : (
                <div className="cand-list">
                  {matches.slice(0, 3).map((m) => {
                    const pct = Math.round((m.aiConfidence ?? m.confidence) * 100);
                    const method = m.method === "aadhaar" ? "Aadhaar" : m.method === "phone" ? "Phone" : "Photo + description";
                    return (
                      <div className="cand" key={m.id}>
                        <div className="ph"><Avatar url={m.foundPhoto} size={26} /></div>
                        <div className="cand-body">
                          <div className="nm">{m.foundName}</div>
                          <div className="mt">{m.foundMeta}</div>
                          <div className="meter"><i style={{ width: `${pct}%` }} /></div>
                          <div className="confline"><span>Similarity</span><span>{pct}%</span></div>
                          <div className="methods"><span className="mtag">{method}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <a className="btn btn-ghost btn-block" href="/dashboard">Open full match board</a>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
