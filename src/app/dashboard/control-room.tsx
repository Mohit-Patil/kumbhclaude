"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Brand } from "@/components/brand";
import { Avatar } from "@/components/avatar";
import { Pill, IconMerge, IconShield, IconCheck, IconX, IconAlert, IconSearch, IconPin } from "@/components/ui";
import { bucketVerdict, verdictLabel, type Verdict } from "@/lib/ai/verdict";
import type { MatchCard, Stats, ReunitedItem } from "@/lib/queries";

type DashData = { stats: Stats; matches: MatchCard[]; reunited: ReunitedItem[] };
type LocalStatus = "proposed" | "reunited" | "dismissed";
type Case = MatchCard & { local: LocalStatus; verifiedVia?: string };

const VERIFY_METHODS = [
  { key: "token", dev: "परिवार टोकन", en: "Family token / QR", desc: "Guardian shows the PNM code from registration." },
  { key: "id", dev: "पहचान पत्र", en: "Guardian photo ID", desc: "Aadhaar or any government photo ID confirms the guardian." },
  { key: "detail", dev: "तय की गई पहचान", en: "Agreed private detail", desc: "A detail only the real family would know." },
];

function methodLabel(m: string) {
  return m === "aadhaar" ? "Aadhaar match" : m === "phone" ? "Phone match" : "Photo + description";
}
function effConfidence(c: MatchCard) { return c.aiConfidence ?? c.confidence; }
function verdictOf(c: MatchCard): Verdict { return (c.aiVerdict as Verdict | null) ?? bucketVerdict(effConfidence(c)); }

export default function ControlRoom({ data }: { data: DashData }) {
  const [cases, setCases] = useState<Case[]>(() => data.matches.map((m) => ({ ...m, local: "proposed" })));
  const [conf, setConf] = useState<"all" | "high" | "review">("all");
  const [method, setMethod] = useState<"all" | "aadhaar" | "phone" | "attribute">("all");
  const [show, setShow] = useState<"open" | "reunited">("open");
  const [selectedId, setSelectedId] = useState<string | null>(data.matches[0]?.id ?? null);

  const filtered = useMemo(() => cases.filter((c) => {
    if (show === "open" && c.local !== "proposed") return false;
    if (show === "reunited" && c.local !== "reunited") return false;
    const eff = effConfidence(c);
    if (conf === "high" && eff < 0.8) return false;
    if (conf === "review" && eff >= 0.8) return false;
    if (method !== "all" && c.method !== method) return false;
    return true;
  }), [cases, conf, method, show]);

  const selected = cases.find((c) => c.id === selectedId) ?? filtered[0] ?? null;
  const openCount = cases.filter((c) => c.local === "proposed").length;
  const reunitedCount = data.stats.reunitedToday + cases.filter((c) => c.local === "reunited").length;

  function confirmReunion(id: string, via: string) {
    setCases((cs) => cs.map((c) => (c.id === id ? { ...c, local: "reunited", verifiedVia: via } : c)));
  }
  function dismiss(id: string) {
    setCases((cs) => cs.map((c) => (c.id === id ? { ...c, local: "dismissed" } : c)));
  }

  return (
    <div className="cr">
      <header className="cr-top">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Brand size={36} />
          <span className="cr-chip"><IconMerge size={15} /> <span className="dev">मिलान केंद्र</span> Match &amp; reunite</span>
        </div>
        <div className="cr-ctx">
          <div className="cell"><div className="k">Coverage</div><div className="v">Sectors 1–25 · live</div></div>
          <Link href="/map" className="cr-link"><IconPin size={14} /> Search map</Link>
          <div className="cell"><div className="k">Supervisor</div><div className="v">R. Verma</div></div>
        </div>
      </header>

      <div className="cr-stats">
        <div className="cr-stat s-missing"><div className="n">{data.stats.openMissing}</div><div className="k">Open <b>missing</b></div></div>
        <div className="cr-stat s-found"><div className="n">{data.stats.openFound}</div><div className="k">Found, <b>awaiting</b> match</div></div>
        <div className="cr-stat s-candidate"><div className="n">{openCount}</div><div className="k">Candidate <b>matches</b> to confirm</div></div>
        <div className="cr-stat s-reunited"><div className="n">{reunitedCount}</div><div className="k"><b>Reunited</b> today</div></div>
      </div>

      <div className="cr-main">
        <div className="cr-queue">
          <div className="cr-filters">
            <div>
              <div className="flabel">Show</div>
              <div className="frow">
                <button className="fbtn" aria-pressed={show === "open"} onClick={() => setShow("open")}>Open ({cases.filter(c => c.local === "proposed").length})</button>
                <button className="fbtn" aria-pressed={show === "reunited"} onClick={() => setShow("reunited")}>Reunited</button>
              </div>
            </div>
            <div>
              <div className="flabel">Confidence</div>
              <div className="frow">
                <button className="fbtn" aria-pressed={conf === "all"} onClick={() => setConf("all")}>All</button>
                <button className="fbtn" aria-pressed={conf === "high"} onClick={() => setConf("high")}>High ≥80%</button>
                <button className="fbtn" aria-pressed={conf === "review"} onClick={() => setConf("review")}>Needs review</button>
              </div>
            </div>
            <div>
              <div className="flabel">Method</div>
              <div className="frow">
                <button className="fbtn" aria-pressed={method === "all"} onClick={() => setMethod("all")}>All</button>
                <button className="fbtn" aria-pressed={method === "aadhaar"} onClick={() => setMethod("aadhaar")}>Aadhaar</button>
                <button className="fbtn" aria-pressed={method === "phone"} onClick={() => setMethod("phone")}>Phone</button>
                <button className="fbtn" aria-pressed={method === "attribute"} onClick={() => setMethod("attribute")}>AI</button>
              </div>
            </div>
          </div>

          <div className="cr-queue-list">
            {filtered.map((c) => {
              const pct = Math.round(effConfidence(c) * 100);
              return (
                <button key={c.id} className="qcase q-missing" aria-pressed={selected?.id === c.id} onClick={() => setSelectedId(c.id)}>
                  <div className="ph"><Avatar url={c.missingPhoto} size={22} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nm">{c.missingName}</div>
                    <div className="mt">↔ {c.foundName}</div>
                  </div>
                  <div className="ago">{c.local === "reunited" ? "done" : `${pct}%`}</div>
                </button>
              );
            })}
            {filtered.length === 0 && <div className="cr-empty"><IconSearch size={28} /><span>No cases match these filters.</span></div>}
          </div>
        </div>

        {selected ? (
          <CaseDetail key={selected.id} c={selected} onConfirm={confirmReunion} onDismiss={dismiss} />
        ) : (
          <div className="cr-detail"><div className="cr-empty"><IconMerge size={32} /><span>Select a case to review.</span></div></div>
        )}
      </div>
    </div>
  );
}

function CaseDetail({ c, onConfirm, onDismiss }: { c: Case; onConfirm: (id: string, via: string) => void; onDismiss: (id: string) => void }) {
  const [modal, setModal] = useState(false);
  const pct = Math.round(effConfidence(c) * 100);
  const verdict = verdictOf(c);

  return (
    <section className="cr-detail">
      <div className="cr-detail-head">
        <h2><span className="dev">मिलान की समीक्षा</span><span className="en">Review candidate match</span></h2>
        {c.local === "reunited" ? <Pill status="reunited" /> : <Pill status="candidate" />}
      </div>

      <div className="compare">
        <div className="cmp c-missing">
          <div className="cmp-photo"><Avatar url={c.missingPhoto} size={48} /></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><span className="nm">{c.missingName}</span><Pill status="missing" small /></div>
          <div className="mt">{c.missingMeta}</div>
        </div>
        <div className="cmp-merge"><div className="node"><IconMerge size={22} /></div></div>
        <div className="cmp c-found">
          <div className="cmp-photo"><Avatar url={c.foundPhoto} size={48} /></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><span className="nm">{c.foundName}</span><Pill status="found" small /></div>
          <div className="mt">{c.foundMeta}</div>
        </div>
      </div>

      <div className="rationale">
        <div className="conf-big">
          <h3 style={{ margin: 0 }}><IconAlert size={15} /> <span className="dev">मिलान क्यों</span> Why this matched</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`vbadge2 ${verdict}`}>{verdictLabel(verdict)}</span>
            <span className="pct">{pct}%</span>
          </div>
        </div>
        <p>{c.aiRationale ?? `${methodLabel(c.method)} — confirmed by the match engine.`}</p>
      </div>

      {c.local === "reunited" ? (
        <div className="note"><IconShield size={18} /><span><span className="dev">पुनर्मिलन की पुष्टि</span> Reunion confirmed · verified via {c.verifiedVia}. Case closed.</span></div>
      ) : (
        <div className="cr-actions">
          <button className="btn btn-reunited btn-sm grow" onClick={() => setModal(true)}><IconShield size={18} /> <span className="dev">पुनर्मिलन की पुष्टि</span> Confirm reunion</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onDismiss(c.id)}><IconX size={18} /> Not a match</button>
        </div>
      )}

      <div className="audit">
        <h3>Audit trail</h3>
        <ol>
          <li><span className="dot" /><span><span className="at">Missing report filed</span> <span className="who">· {c.missingMeta}</span></span></li>
          <li><span className="dot" /><span><span className="at">Found person logged</span> <span className="who">· {c.foundMeta}</span></span></li>
          <li><span className="dot" style={{ background: "var(--candidate)" }} /><span><span className="at">Candidate match proposed · {methodLabel(c.method)}</span> <span className="who">· Match engine</span></span></li>
          <li><span className="dot" style={{ background: c.local === "reunited" ? "var(--reunited)" : "var(--candidate)" }} /><span><span className="at">{c.local === "reunited" ? `Reunion verified via ${c.verifiedVia}` : "Awaiting verification"}</span> {c.local === "reunited" && <span className="who">· R. Verma</span>}</span></li>
        </ol>
      </div>

      {modal && <VerifyGate c={c} onClose={() => setModal(false)} onConfirm={(via) => { onConfirm(c.id, via); setModal(false); }} />}
    </section>
  );
}

function VerifyGate({ c, onClose, onConfirm }: { c: Case; onClose: () => void; onConfirm: (via: string) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const ready = !!pick && value.trim().length > 1;
  const chosen = VERIFY_METHODS.find((m) => m.key === pick);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Verify before reuniting" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2><span className="dev">पुनर्मिलन से पहले पहचान की पुष्टि करें</span><span className="en">Verify identity before reuniting</span></h2>
        <div className="verify-warn"><IconAlert size={18} /><span><span className="dev">ग़लत पुनर्मिलन सबसे बड़ी चूक है।</span> A wrong reunion is the worst possible failure. Confirm the guardian with at least one method.</span></div>
        <p>{c.missingName} ↔ {c.foundName} · {Math.round(effConfidence(c) * 100)}% confidence</p>
        <div className="vmethods">
          {VERIFY_METHODS.map((m) => (
            <button key={m.key} type="button" className="vmethod" aria-pressed={pick === m.key} onClick={() => setPick(m.key)}>
              <span className="vradio" />
              <span><span className="vt"><span className="dev">{m.dev}</span><span className="en">{m.en}</span></span><span className="vd">{m.desc}</span></span>
            </button>
          ))}
        </div>
        {pick && (
          <label className="field">
            <span className="field-label"><span className="field-label-text"><span className="dev">पुष्टि दर्ज करें</span><span className="en">Record what confirmed it — {chosen?.en}</span></span></span>
            <input className="input" value={value} autoFocus placeholder={pick === "token" ? "PNM-XXXX-XX" : pick === "id" ? "ID type + last 4 digits" : "The detail they gave"} onChange={(e) => setValue(e.target.value)} />
          </label>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost grow" onClick={onClose}>Cancel</button>
          <button className="btn btn-reunited grow" disabled={!ready} onClick={() => onConfirm(`${chosen?.en} (${value.trim()})`)}><IconCheck size={18} /> <span className="dev">पुष्टि करें</span> Confirm reunion</button>
        </div>
      </div>
    </div>
  );
}
