import Link from "next/link";
import { Mark } from "@/components/brand";
import { Avatar } from "@/components/avatar";

const FACE = (id: string) => `/faces/${id}.jpg`;

export default function Register() {
  return (
    <div className="screen-mobile">
      <div className="m-top">
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

      <div className="m-body">
        <div className="m-hero">
          <div className="eyebrow">Family registration</div>
          <h1 className="title">
            Register your family
            <span className="hi">अपने परिवार को पंजीकृत करें</span>
          </h1>
          <p>
            If anyone is separated in the crowd, a registered family ID lets any booth reunite you in minutes.
          </p>
          <div className="step">
            <b>Step 1 of 2</b> · Your details
            <div className="bar">
              <i />
            </div>
          </div>
        </div>

        <div className="card grp">
          <h2>
            Head of family <span className="hi">परिवार के मुखिया</span>
          </h2>
          <div className="field">
            <label>
              Full name <span className="hi">पूरा नाम</span>
              <span className="req">*</span>
            </label>
            <input className="input" defaultValue="Suresh Yadav" />
          </div>
          <div className="row2">
            <div className="field">
              <label>
                Mobile <span className="hi">मोबाइल</span>
                <span className="req">*</span>
              </label>
              <input className="input mono" defaultValue="+91 98270 …" />
            </div>
            <div className="field">
              <label>
                Aadhaar <span className="opt">Optional</span>
              </label>
              <input className="input ph mono" defaultValue="XXXX XXXX 4821" />
            </div>
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
          <div className="people">
            <div className="person">
              <div className="av av-silhouette">
                <Avatar url={FACE("c0000000-0000-0000-0000-000000000010")} />
              </div>
              <div>
                <div className="nm">Aarti Yadav</div>
                <div className="mt">Daughter · Age 7</div>
              </div>
              <span className="chip missing tag">
                <span className="dot" />
                Child
              </span>
            </div>
            <div className="person">
              <div className="av av-silhouette">
                <Avatar url={FACE("c0000000-0000-0000-0000-000000000002")} />
              </div>
              <div>
                <div className="nm">Kamla Devi</div>
                <div className="mt">Mother · Age 71</div>
              </div>
              <span className="chip ghost tag">Elder</span>
            </div>
            <div className="addp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A574B" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add a person <span className="hi" style={{ fontWeight: 500, color: "var(--ink-faint)" }}>व्यक्ति जोड़ें</span>
            </div>
          </div>
        </div>

        <div className="card grp">
          <h2>
            Photos of each person <span className="hi">हर व्यक्ति की तस्वीर</span>
          </h2>
          <p className="hint" style={{ marginTop: "-4px" }}>
            A clear face photo is the fastest way to match someone who is found.
          </p>
          <div className="shots">
            <div className="shot done">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0E7C6B" strokeWidth="2" aria-hidden>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="lab" style={{ color: "var(--teal-deep)" }}>
                Aarti · captured
              </div>
            </div>
            <div className="shot">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A9690" strokeWidth="1.9" aria-hidden>
                <rect x="3" y="6" width="18" height="13" rx="3" />
                <circle cx="12" cy="12.5" r="3.2" />
                <path d="M8 6l1.5-2h5L16 6" />
              </svg>
              <div className="lab">
                Add photo
                <br />
                Kamla Devi
              </div>
            </div>
          </div>
        </div>

        <div className="card grp">
          <h2>
            Where are you headed?
            <span className="opt">Optional</span>
          </h2>
          <div className="chips">
            <span className="pchip on">Triveni Sangam</span>
            <span className="pchip on">Akhara Marg</span>
            <span className="pchip">Ram Ghat</span>
            <span className="pchip">Sector 8 Camp</span>
            <span className="pchip">Bade Hanuman</span>
          </div>
        </div>
        <div style={{ height: "6px" }} />
      </div>

      <div className="m-foot">
        <button className="btn btn-primary btn-block btn-lg">
          Create family ID <span className="sub">परिवार आईडी बनाएं</span>
        </button>
        <div className="trust">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A9690" strokeWidth="2" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
          Takes under 2 minutes · No internet needed at the booth
        </div>
      </div>
    </div>
  );
}
