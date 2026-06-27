import Link from "next/link";
import { Mark } from "@/components/brand";
import { PhotoCapture } from "@/components/photo-capture";
import { FamilyMembers } from "@/components/family-members";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function Register() {
  return (
    <div className="reg-single">
      <header className="reg-s-head">
        <div className="reg-s-top">
          <Link href="/" className="brand" aria-label="Punarmilan home">
            <Mark size={38} />
            <div className="name">
              पुनर्मिलन<small>Punarmilan · Khoya–Paya</small>
            </div>
          </Link>
          <div className="lang">
            <span className="on">EN</span>
            <span className="off hi">हिं</span>
          </div>
        </div>

        <div className="eyebrow">Family registration</div>
        <h1 className="title">
          Register your family
          <span className="hi">अपने परिवार को पंजीकृत करें</span>
        </h1>
        <p className="reg-s-lede">
          If anyone is separated in the crowd, a registered family ID lets any booth reunite you in minutes.
        </p>
        <div className="reg-s-step">
          <span className="reg-s-step-row">
            <b>Step 1 of 2</b> · Your details
          </span>
          <span className="reg-s-step-bar">
            <i />
          </span>
        </div>
      </header>

      <main className="reg-s-body">
        <div className="card grp">
          <h2>
            Head of family <span className="hi">परिवार के मुखिया</span>
          </h2>
          <div className="head-row">
            <div className="head-photo">
              <PhotoCapture name="You" />
            </div>
            <div className="field head-main">
              <label>
                Full name <span className="hi">पूरा नाम</span>
                <span className="req">*</span>
              </label>
              <input className="input" placeholder="e.g. Suresh Yadav" />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>
                Mobile <span className="hi">मोबाइल</span>
                <span className="req">*</span>
              </label>
              <input className="input mono" type="tel" inputMode="tel" placeholder="+91 98765 43210" />
            </div>
            <div className="field">
              <label>
                Aadhaar <span className="opt">Optional</span>
              </label>
              <input className="input mono" inputMode="numeric" placeholder="XXXX XXXX XXXX" />
            </div>
          </div>
          <div className="field">
            <label>
              Home state <span className="hi">गृह राज्य</span>
              <span className="opt">For language &amp; routing</span>
            </label>
            <select className="input select" defaultValue="">
              <option value="" disabled>
                Select your state
              </option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="secure">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2l8 4v6c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-4z" fill="#0E7C6B" />
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Aadhaar is encrypted and never shown to anyone — used only to confirm a match.
          </div>
        </div>

        <div className="card grp">
          <h2>
            People travelling with you <span className="hi">आपके साथ के लोग</span>
          </h2>
          <FamilyMembers />
        </div>
      </main>

      <footer className="reg-s-foot">
        <button className="btn btn-primary btn-block btn-lg">
          Create family ID <span className="sub">परिवार आईडी बनाएं</span>
        </button>
        <div className="trust">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A9690" strokeWidth="2" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
          Your details stay on the Kumbh booth network · Works offline
        </div>
      </footer>
    </div>
  );
}
