"use client";

import { useActionState } from "react";
import LocationField from "./LocationField";
import { fileMissingReport, type FileReportState } from "./actions";
import { Field, IconCheck, IconShield, IconSearch, IconAlert } from "@/components/ui";

export default function MissingForm() {
  const [state, formAction, pending] = useActionState<FileReportState, FormData>(fileMissingReport, null);
  const error = state && state.ok === false ? state.error : null;

  return (
    <>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="block">
          <div className="block-head"><span className="block-num">1</span><h2><span className="dev">व्यक्ति</span><span className="en">The person</span></h2></div>
          <div className="with-photo">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field dev="नाम" en="Name" optional><input className="input" name="name" placeholder="If known" defaultValue="Aarti Yadav" /></Field>
              <div className="two">
                <Field dev="उम्र" en="Age" optional><input className="input" name="age" placeholder="e.g. 7" defaultValue="7" /></Field>
                <Field dev="लिंग" en="Gender" optional><input className="input" name="gender" defaultValue="Girl" /></Field>
              </div>
              <Field dev="पहनावा / पहचान" en="What were they wearing?"><input className="input" name="wearing" defaultValue="Red frock, yellow hairband, silver anklets" /></Field>
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
            <Field dev="समय — से" en="Time — from"><input className="input" name="lastSeenFrom" type="time" defaultValue="13:30" /></Field>
            <Field dev="समय — तक" en="Time — to"><input className="input" name="lastSeenTo" type="time" defaultValue="13:50" /></Field>
          </div>
        </section>

        <section className="block">
          <div className="block-head"><span className="block-num">3</span><h2><span className="dev">आपका संपर्क</span><span className="en">Your contact (guardian)</span></h2></div>
          <div className="two">
            <Field dev="फ़ोन नंबर" en="Phone number"><input className="input" name="reporterMobile" type="tel" inputMode="numeric" placeholder="+91 —" defaultValue="+91 98270 00000" /></Field>
            <Field dev="आपका नाम" en="Your name" optional><input className="input" name="reporterName" defaultValue="Suresh Yadav" /></Field>
          </div>
          <Field dev="संबंध" en="Relation" optional><input className="input" name="relation" defaultValue="Father" /></Field>
          <div className="note"><IconShield size={18} /><span><span className="dev">मिलते ही हम आपको कॉल करेंगे।</span> We&rsquo;ll call this number the moment a matching found-report comes in.</span></div>
        </section>

        {error && (
          <div className="verify-warn" role="alert" aria-live="assertive"><IconAlert size={18} /><span>{error}</span></div>
        )}

        <button type="submit" className="btn btn-missing btn-block" disabled={pending}>
          <IconSearch size={20} /> {pending ? <span>Filing report…</span> : <><span className="dev">सूचना दर्ज करें</span> File missing report</>}
        </button>
      </form>

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
