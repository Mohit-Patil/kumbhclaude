import Link from "next/link";
import { Brand } from "@/components/brand";

function Arrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

type Role = {
  href: string;
  accent: "reg" | "missing" | "found" | "match" | "map" | "analytics";
  title: string; hi: string; device: string; deviceHi: string; glyph: React.ReactNode;
};

const roles: Role[] = [
  {
    href: "/map", accent: "map",
    title: "Search map", hi: "खोज नक्शा", device: "Operator", deviceHi: "ऑपरेटर",
    glyph: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z" /><path d="M9 4v14M15 6v14" /></svg>),
  },
  {
    href: "/register?kiosk=1", accent: "reg",
    title: "Register a family", hi: "परिवार पंजीकरण", device: "Self / kiosk", deviceHi: "स्वयं · कियोस्क",
    glyph: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>),
  },
  {
    href: "/report-missing?kiosk=1", accent: "missing",
    title: "Report missing", hi: "गुमशुदा की सूचना", device: "Booth tablet", deviceHi: "बूथ टैबलेट",
    glyph: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" /><path d="M11 7.5v4M11 14.5h.01" /></svg>),
  },
  {
    href: "/report-found?kiosk=1", accent: "found",
    title: "Report found", hi: "मिला हुआ व्यक्ति", device: "Booth tablet", deviceHi: "बूथ टैबलेट",
    glyph: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0116 0z" /><circle cx="12" cy="10" r="3" /></svg>),
  },
  {
    href: "/dashboard", accent: "match",
    title: "Match & reunite", hi: "मिलान व पुनर्मिलन", device: "Control room", deviceHi: "नियंत्रण कक्ष",
    glyph: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 4v7a5 5 0 0010 0V4" /><circle cx="7" cy="4" r="1.7" /><circle cx="17" cy="4" r="1.7" /><circle cx="12" cy="20" r="2" /><path d="M12 16v2" /></svg>),
  },
  {
    href: "/admin", accent: "analytics",
    title: "Analytics", hi: "विश्लेषण", device: "Administration", deviceHi: "प्रशासन",
    glyph: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 19V5M4 19h16" /><rect x="7" y="11" width="3" height="5" /><rect x="12" y="8" width="3" height="8" /><rect x="17" y="13" width="3" height="3" /></svg>),
  },
];

export default function Home() {
  return (
    <div className="launch">
      <header className="idband">
        <Brand />
        <div className="idband-where">
          <span className="dev">त्रिवेणी संगम · सेक्टर १–२५</span>
          <span className="en">Triveni Sangam · Sectors 1–25</span>
        </div>
      </header>

      <main className="launch-main">
        <div className="launch-head">
          <h1>
            <span className="dev">अपनी स्क्रीन चुनें</span>
            <span className="en">Choose your screen</span>
          </h1>
          <p>
            <span className="dev">हर स्क्रीन एक ही रिकॉर्ड से जुड़ी है।</span>
            <span className="en">Every screen shares the same records.</span>
          </p>
        </div>

        <nav className="roles" aria-label="Choose a screen">
          {roles.map((r) => (
            <Link key={r.href} href={r.href} className={`role role-${r.accent}`}>
              <span className="role-ico" aria-hidden>{r.glyph}</span>
              <span className="role-body">
                <span className="role-device"><span className="dev">{r.deviceHi}</span><span className="en">{r.device}</span></span>
                <span className="role-title"><span className="dev">{r.hi}</span><span className="en">{r.title}</span></span>
              </span>
              <span className="role-go" aria-hidden><Arrow /></span>
            </Link>
          ))}
        </nav>
      </main>

      <footer className="launch-foot">
        <span className="dev">पुनर्मिलन — कुंभ खोया–पाया सेवा</span>
        <span className="en">Punarmilan — Kumbh reunification service · Booth network</span>
      </footer>
    </div>
  );
}
