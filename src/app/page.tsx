import Link from "next/link";
import { Brand } from "@/components/brand";

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const screens = [
  {
    href: "/register",
    icon: "reg",
    title: "Register a family",
    hi: "परिवार पंजीकरण",
    dev: "Kiosk · Public mobile",
    body: "Pre-register a pilgrim and the people travelling with them, so any booth can identify them if they are separated.",
    glyph: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A574B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
    ),
  },
  {
    href: "/report-missing",
    icon: "miss",
    title: "Report missing",
    hi: "गुमशुदा की सूचना",
    dev: "Booth agent · Tablet",
    body: "File a missing-person report fast — last-seen time and place, a photo, and the guardian's contact.",
    glyph: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A82618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-3.5-3.5"/><path d="M11 8v3M11 14h.01"/></svg>
    ),
  },
  {
    href: "/report-found",
    icon: "found",
    title: "Report found",
    hi: "मिला हुआ व्यक्ति",
    dev: "Booth agent · Tablet",
    body: "Log an unidentified person found and brought to a booth, with a photo and where they were found.",
    glyph: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C97D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
  },
  {
    href: "/dashboard",
    icon: "ctrl",
    title: "Match & reunite",
    hi: "मिलान व पुनर्मिलन",
    dev: "Control room · Desktop",
    body: "Review candidate matches where missing and found reports meet, confirm a reunion, and track every case.",
    glyph: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39517d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v7a5 5 0 005 5 5 5 0 005-5V4"/><circle cx="7" cy="4" r="1.6"/><circle cx="17" cy="4" r="1.6"/><circle cx="12" cy="20" r="1.8"/></svg>
    ),
  },
  {
    href: "/map",
    icon: "map",
    title: "Search map",
    hi: "खोज नक्शा",
    dev: "Control room · Live map",
    body: "Plot missing and found reports on the city map with CCTV, police and crowd choke points — then build a search plan for any case.",
    glyph: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0E7C6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2z"/><path d="M9 3v16M15 5v16"/></svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="landing">
      <header className="hero">
        <svg className="sangam" viewBox="0 0 200 200" fill="none" aria-hidden>
          <path d="M30 0 C 70 80, 95 90, 100 130" stroke="#D33A2C" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
          <path d="M170 0 C 130 80, 105 90, 100 130" stroke="#F2A310" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
          <path d="M100 130 L100 200" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/>
        </svg>
        <Brand />
        <h1>
          Every separated face, <span className="accent">brought home.</span>
        </h1>
        <p className="lede">
          Punarmilan is the Kumbh&rsquo;s <span className="hi">खोया–पाया</span> service — a single thread
          connecting registration, missing reports, and found reports so any booth can reunite people in minutes.
        </p>
      </header>

      <main className="grid">
        {screens.map((s) => (
          <Link key={s.href} href={s.href} className="tile">
            <div className={`ti ${s.icon}`}>{s.glyph}</div>
            <div className="dev">{s.dev}</div>
            <h3>
              {s.title} <span className="hi">{s.hi}</span>
            </h3>
            <p>{s.body}</p>
            <span className="go">
              Open screen <Arrow />
            </span>
          </Link>
        ))}
      </main>

      <footer className="foot">
        A prototype reunification system · Sectors 1–25, Triveni Sangam · Booth network demo
      </footer>
    </div>
  );
}
