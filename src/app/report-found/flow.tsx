"use client";

import { useState } from "react";
import type { MatchCard } from "@/lib/queries";
import { Avatar } from "@/components/avatar";
import {
  BoothTop, Field, PhotoCapture, SectorMap, Steps, Pill, SyncIndicator, useDraft,
  IconPin, IconCheck, IconBack, IconArrow, IconSearch, IconShield, IconText,
} from "@/components/ui";

type DraftShape = {
  describe: string; hasPhoto: boolean; sector: number | null; foundTime: string;
  ageRange: string; speech: string; saidName: string;
};

const STEP_LABELS = [
  { dev: "तस्वीर", en: "Photo" },
  { dev: "कहाँ मिला", en: "Where found" },
  { dev: "जानकारी", en: "About them" },
];
const SPEECH = [
  { dev: "बात कर सकते हैं", en: "Can speak" },
  { dev: "एक नाम बताते हैं", en: "Says a name" },
  { dev: "बात नहीं कर पाते", en: "Cannot speak" },
];
const AGES = ["0–2", "3–5", "6–9", "10–14", "15–25", "26–45", "46–65", "65+"];

export default function FoundFlow({ kiosk, matches }: { kiosk: boolean; matches: MatchCard[] }) {
  const { draft, setField, sync } = useDraft<DraftShape>("punarmilan.found", {
    describe: "", hasPhoto: false, sector: null, foundTime: "", ageRange: "", speech: "", saidName: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [showDescribe, setShowDescribe] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const step1Ok = !!photo || draft.describe.trim().length > 2;

  function onPhoto(url: string | null) { setPhoto(url); setField({ hasPhoto: !!url }); }

  if (submitted) {
    return (
      <div className="civic">
        <BoothTop kiosk={kiosk} titleDev="मिला हुआ व्यक्ति" titleEn="Report found" />
        <main className="civic-main" style={{ paddingBottom: 40 }}>
          <div className="result-head">
            <span className="ico"><IconCheck size={26} /></span>
            <div className="civic-head"><h1><span className="dev">व्यक्ति दर्ज — सुरक्षित</span><span className="en">Logged — person is safe at the booth</span></h1></div>
          </div>
          <div className="note"><IconShield size={18} /><span><span className="dev">उनके परिवार की खुली सूचनाओं से मिलान किया जा रहा है।</span> Matching against open missing reports right now.</span></div>
          <section className="block">
            <div className="block-head"><h2><span className="dev">संभावित परिवार</span><span className="en">Possible families looking for them</span></h2></div>
            <p className="hint"><span className="dev">स्टाफ़ पुष्टि के बाद ही पुनर्मिलन होगा।</span> A booth confirms identity before reuniting.</p>
            <CandidateList matches={matches} />
            <a className="btn btn-ghost btn-block" href="/dashboard"><IconSearch size={20} /> <span className="dev">पूरा मिलान बोर्ड खोलें</span> Open full match board</a>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="civic">
      <BoothTop kiosk={kiosk} titleDev="मिला हुआ व्यक्ति" titleEn="Report found" />
      <main className="civic-main">
        <div className="civic-head">
          <h1><span className="dev">आपको कौन मिला?</span><span className="en">Who did you find?</span></h1>
          <p><span className="dev">सबसे ज़रूरी है उनकी तस्वीर — हो सकता है वे बता न पाएँ।</span> Their photo matters most — they may not be able to tell you anything.</p>
        </div>
        <Steps current={step} labels={STEP_LABELS} />

        {step === 1 && (
          <section className="block">
            <div className="block-head"><span className="block-num">1</span><h2><span className="dev">उनकी तस्वीर</span><span className="en">A photo of the person</span></h2></div>
            <PhotoCapture value={photo} onChange={onPhoto} big required />
            {!showDescribe ? (
              <button type="button" className="alt-toggle" onClick={() => setShowDescribe(true)}><IconText size={18} /> <span className="dev">फ़ोटो नहीं ले पा रहे? हुलिया लिखें</span> · Can&rsquo;t take a photo? Describe them</button>
            ) : (
              <Field dev="हुलिया" en="Describe the person" hint="Approximate age, clothes, marks.">
                <textarea className="input" rows={3} value={draft.describe} placeholder="e.g. Elderly woman, white saree, confused, barefoot" onChange={(e) => setField({ describe: e.target.value })} />
              </Field>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="block">
            <div className="block-head"><span className="block-num">2</span><h2><span className="dev">कहाँ मिला</span><span className="en">Where & when found</span></h2></div>
            <div className="field">
              <span className="field-label"><span className="field-label-text"><span className="dev">सेक्टर चुनें (१–२५)</span><span className="en">Tap the sector</span></span></span>
              <SectorMap value={draft.sector} onChange={(n) => setField({ sector: n })} />
              {draft.sector && <span className="hint" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink)" }}><IconPin size={16} /> <span className="dev">सेक्टर {draft.sector}</span> · Sector {draft.sector}</span>}
            </div>
            <Field dev="कब मिला" en="Time found" hint="Defaults to now — adjust if needed.">
              <input className="input" type="time" value={draft.foundTime} onChange={(e) => setField({ foundTime: e.target.value })} />
            </Field>
          </section>
        )}

        {step === 3 && (
          <section className="block">
            <div className="block-head"><span className="block-num">3</span><h2><span className="dev">उनके बारे में</span><span className="en">About them</span></h2></div>
            <div className="field">
              <span className="field-label"><span className="field-label-text"><span className="dev">अनुमानित उम्र</span><span className="en">Approximate age</span></span></span>
              <div className="chips">{AGES.map((a) => (<button key={a} type="button" className="chip-toggle" aria-pressed={draft.ageRange === a} onClick={() => setField({ ageRange: a })}>{a}</button>))}</div>
            </div>
            <div className="field">
              <span className="field-label"><span className="field-label-text"><span className="dev">क्या वे बात कर सकते हैं?</span><span className="en">Can they communicate?</span></span></span>
              <div className="chips">{SPEECH.map((sp) => (<button key={sp.en} type="button" className="chip-toggle" aria-pressed={draft.speech === sp.en} onClick={() => setField({ speech: sp.en })}><span className="dev">{sp.dev}</span> {sp.en}</button>))}</div>
            </div>
            <Field dev="कोई नाम जो वे बताएँ" en="A name they say" optional>
              <input className="input" placeholder="If they can tell you" value={draft.saidName} onChange={(e) => setField({ saidName: e.target.value })} />
            </Field>
          </section>
        )}
      </main>

      <div className="savebar">
        <div className="savebar-inner">
          <SyncIndicator state={sync} />
          {step > 1 && <button className="btn btn-ghost" style={{ flex: "0 0 auto" }} onClick={() => setStep(step - 1)}><IconBack size={20} /> Back</button>}
          {step < 3 ? (
            <button className="btn btn-ink" disabled={step === 1 && !step1Ok} onClick={() => setStep(step + 1)}><span className="dev">आगे</span> Next <IconArrow size={20} /></button>
          ) : (
            <button className="btn btn-found" disabled={!step1Ok} onClick={() => { setSubmitted(true); window.scrollTo({ top: 0 }); }}><IconCheck size={20} /> <span className="dev">दर्ज करें</span> Log found person</button>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateList({ matches }: { matches: MatchCard[] }) {
  if (matches.length === 0) return <p className="hint"><span className="dev">अभी कोई खुली सूचना मेल नहीं खाती।</span> No open missing reports match yet — staff will keep checking.</p>;
  return (
    <div className="cand-list">
      {matches.slice(0, 4).map((m) => {
        const pct = Math.round((m.aiConfidence ?? m.confidence) * 100);
        const method = m.method === "aadhaar" ? "Aadhaar" : m.method === "phone" ? "Phone" : "Photo + description";
        return (
          <div className="cand" key={m.id}>
            <div className="ph"><Avatar url={m.missingPhoto} size={26} /></div>
            <div className="cand-body">
              <div className="nm">{m.missingName}</div>
              <div className="mt">{m.missingMeta}</div>
              <div className="meter"><i style={{ width: `${pct}%` }} /></div>
              <div className="confline"><span><span className="dev">समानता</span> Similarity</span><span>{pct}%</span></div>
              <div className="methods"><span className="mtag">{method}</span><Pill status="candidate" small /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
