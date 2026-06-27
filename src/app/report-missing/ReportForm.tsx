"use client";

import { useActionState } from "react";
import LocationField from "./LocationField";
import { PhotoCapture } from "@/components/photo-capture";
import { fileMissingReport, type FileReportState } from "./actions";

export default function ReportForm() {
  const [state, formAction, pending] = useActionState<FileReportState, FormData>(
    fileMissingReport,
    null,
  );
  const error = state && state.ok === false ? state.error : null;

  return (
    <>
      <form className="card formcard" action={formAction}>
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

        {error && (
          <p className="formerr" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <div className="factions">
          <button type="submit" className="btn btn-danger grow btn-lg" disabled={pending}>
            {pending ? (
              "Filing report…"
            ) : (
              <>
                File missing report <span className="sub">सूचना दर्ज करें</span>
              </>
            )}
          </button>
          <button type="button" className="btn btn-ghost" disabled={pending}>
            Save draft
          </button>
        </div>
      </form>

      {state?.ok && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="filed-title">
          <div className="modal-card">
            <div className="modal-icon" aria-hidden>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="filed-title" className="modal-title">
              Report filed
              <span className="hi">सूचना दर्ज हो गई</span>
            </h2>
            <p className="modal-body">
              <strong>{state.name}</strong> is now on the active search board. Our match engine
              is already comparing this report against every found-person report — you&rsquo;ll be
              called the moment a match comes in.
            </p>
            <div className="modal-actions">
              <a href="/map" className="btn btn-danger grow">
                View on live map
              </a>
              <a href="/dashboard" className="btn btn-ghost">
                Open match board
              </a>
            </div>
            <button
              type="button"
              className="modal-link"
              onClick={() => window.location.reload()}
            >
              File another report
            </button>
          </div>
        </div>
      )}
    </>
  );
}
