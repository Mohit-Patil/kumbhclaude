"use client";

import { useState } from "react";
import LocationField from "./LocationField";
import { fileMissingReport, type FileReportState } from "./actions";
import { Field, IconCheck, IconShield, IconSearch, IconAlert } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import type { MatchCard } from "@/lib/queries";
import { useActionState } from "react";

export default function MissingForm({ matches }: { matches: MatchCard[] }) {
  const [state, formAction, pending] = useActionState<FileReportState, FormData>(fileMissingReport, null);
  const [started, setStarted] = useState(false);
  const error = state && state.ok === false ? state.error : null;

  // Only surface possible matches once the operator has actually started
  // describing the person — a blank form has nothing to match against.
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    let any = false;
    for (const [, v] of fd.entries()) {
      if (typeof v === "string" && v.trim()) { any = true; break; }
    }
    setStarted(any);
  }

  return (
    <>
      <form action={formAction} onChange={handleChange} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="block">
          <div className="block-head"><span className="block-num">1</span><h2><span className="dev">व्यक्ति</span><span className="en">The person</span></h2></div>
          <div className="with-photo">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field dev="नाम" en="Name" optional><input className="input" name="name" placeholder="If known" /></Field>
              <div className="two">
                <Field dev="उम्र" en="Age" optional><input className="input" name="age" placeholder="e.g. 7" /></Field>
                <Field dev="लिंग" en="Gender" optional><input className="input" name="gender" placeholder="e.g. Girl" /></Field>
              </div>
              <Field dev="पहनावा / पहचान" en="What were they wearing?"><input className="input" name="wearing" placeholder="Clothes, colours, marks" /></Field>
            </div>
            <div className="field">
              <span className="field-label"><span className="field-label-text"><span className="dev">तस्वीर</span><span className="en">Photo</span></span></span>
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
            <Field dev="समय — से" en="Time — from"><input className="input" name="lastSeenFrom" type="time" /></Field>
            <Field dev="समय — तक" en="Time — to"><input className="input" name="lastSeenTo" type="time" /></Field>
          </div>
        </section>

        <section className="block">
          <div className="block-head"><span className="block-num">3</span><h2><span className="dev">आपका संपर्क</span><span className="en">Your contact (guardian)</span></h2></div>
          <div className="two">
            <Field dev="फ़ोन नंबर" en="Phone number"><input className="input" name="reporterMobile" type="tel" inputMode="numeric" placeholder="+91 —" /></Field>
            <Field dev="आपका नाम" en="Your name" optional><input className="input" name="reporterName" placeholder="Your name" /></Field>
          </div>
          <Field dev="संबंध" en="Relation" optional><input className="input" name="relation" placeholder="e.g. Father" /></Field>
          <div className="note"><IconShield size={18} /><span><span className="dev">मिलते ही हम आपको कॉल करेंगे।</span> We&rsquo;ll call this number the moment a matching found-report comes in.</span></div>
        </section>

        {error && (
          <div className="verify-warn" role="alert" aria-live="assertive"><IconAlert size={18} /><span>{error}</span></div>
        )}

        <button type="submit" className="btn btn-missing btn-block" disabled={pending}>
          <IconSearch size={20} /> {pending ? <span>Filing report…</span> : <><span className="dev">सूचना दर्ज करें</span> File missing report</>}
        </button>
      </form>

      <aside className="matches-aside">
        <section className="block">
          <div className="block-head"><h2><span className="dev">संभावित मिलान</span><span className="en">Possible matches</span></h2></div>
          {!started ? (
            <p className="hint"><span className="dev">पहले व्यक्ति का विवरण भरें — मिलान यहाँ दिखेंगे।</span> Start describing the person — possible matches will appear here.</p>
          ) : matches.length === 0 ? (
            <p className="hint"><span className="dev">अभी कोई संभावित मिलान नहीं।</span> No candidate matches yet.</p>
          ) : (
            <>
              <p className="hint"><span className="dev">अभी मिले लोगों से तुलना।</span> Live candidates — staff confirm before reuniting.</p>
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
            </>
          )}
          <a className="btn btn-ghost btn-block" href="/dashboard">Open full match board</a>
        </section>
      </aside>

      {state?.ok && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Report filed">
          <div className="modal">
            <div className="result-head">
              <span className="ico"><IconCheck size={26} /></span>
              <h2><span className="dev">सूचना दर्ज हो गई</span><span className="en">Report filed — search started</span></h2>
            </div>
            <p><strong>{state.name}</strong> is on the active search board. The match engine is already comparing this report against every found-person report — you&rsquo;ll be called the moment a match comes in.</p>
            <div className="modal-actions">
              <a href="/map" className="btn btn-missing grow"><IconSearch size={18} /> View on live map</a>
              <a href="/dashboard" className="btn btn-ghost">Open match board</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
