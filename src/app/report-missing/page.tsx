import { BoothTop } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { getCandidateMatches } from "@/lib/queries";
import MissingForm from "./MissingForm";

export const dynamic = "force-dynamic";

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
          <MissingForm />

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
