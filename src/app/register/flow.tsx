"use client";

import { useState } from "react";
import {
  BoothTop, Field, PhotoCapture, Pill, SyncIndicator, useDraft,
  IconPhone, IconShield, IconCheck, IconX, IconUsers,
} from "@/components/ui";

type Member = { id: string; name: string; relation: string; photo: string | null };
type DraftShape = { contact: string; members: { id: string; name: string; relation: string }[] };

const RELATIONS = [
  { dev: "स्वयं", en: "Myself" },
  { dev: "बच्चा", en: "Child" },
  { dev: "बुज़ुर्ग", en: "Elder" },
  { dev: "पति/पत्नी", en: "Spouse" },
  { dev: "अन्य", en: "Other" },
];

let seq = 0;
const newId = () => `m${Date.now().toString(36)}${seq++}`;

function pseudoMatrix(seed: string, size = 21): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const code = seed.charCodeAt((r * size + c) % seed.length) || 1;
      row.push(((code * (r + 2) * (c + 3)) % 7) < 3);
    }
    grid.push(row);
  }
  const finder = (or: number, oc: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const edge = r === 0 || r === 6 || c === 0 || c === 6;
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[or + r][oc + c] = edge || core;
    }
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  return grid;
}

export default function RegisterFlow({ kiosk }: { kiosk: boolean }) {
  const { draft, setField, sync, clearDraft } = useDraft<DraftShape>("punarmilan.register", {
    contact: "",
    members: [{ id: "head", name: "", relation: "Myself" }],
  });
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const [token, setToken] = useState<string | null>(null);

  const members: Member[] = draft.members.map((m) => ({ ...m, photo: photos[m.id] ?? null }));

  function patchMember(id: string, patch: Partial<{ name: string; relation: string }>) {
    setField({ members: draft.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  }
  function addMember() { setField({ members: [...draft.members, { id: newId(), name: "", relation: "Child" }] }); }
  function removeMember(id: string) {
    setField({ members: draft.members.filter((m) => m.id !== id) });
    setPhotos((p) => { const n = { ...p }; delete n[id]; return n; });
  }
  function setPhoto(id: string, url: string | null) { setPhotos((p) => ({ ...p, [id]: url })); }

  const phoneOk = draft.contact.replace(/\D/g, "").length >= 10;
  const named = members.filter((m) => m.name.trim());
  const canSubmit = phoneOk && named.length >= 1;

  function createToken() {
    const rand = (n: number) => Array.from({ length: n }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
    setToken(`PNM-${rand(4)}-${rand(2)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startOver() { clearDraft(); setPhotos({}); setToken(null); }

  if (token) {
    const matrix = pseudoMatrix(token);
    return (
      <div className="civic">
        <BoothTop kiosk={kiosk} titleDev="परिवार पंजीकरण" titleEn="Register a family" />
        <main className="civic-main" style={{ paddingBottom: 40 }}>
          <div className="result-head">
            <span className="ico"><IconCheck size={26} /></span>
            <div className="civic-head"><h1><span className="dev">परिवार पंजीकृत हो गया</span><span className="en">Your family is registered</span></h1></div>
          </div>
          <div className="token-card">
            <Pill status="registered" />
            <svg className="token-qr" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-label={`Family code ${token}`}>
              {matrix.flatMap((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#1a1a1a" /> : null))}
            </svg>
            <div className="token-code">{token}</div>
            <p className="token-hint">
              <span className="dev">यह कोड किसी भी बूथ पर दिखाएँ। कोई बिछड़ जाए तो स्टाफ़ इससे आपको तुरंत जोड़ देगा।</span><br />
              <span style={{ color: "var(--ink)" }}>Show this code at any booth. If anyone is separated, staff use it to reunite your group fast.</span>
            </p>
            <div className="token-members">{named.map((m) => <Pill key={m.id} status="registered" small />)}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{named.length} {named.length === 1 ? "person" : "people"} · {draft.contact || "no contact"}</div>
          </div>
          <button className="btn btn-ghost btn-block" onClick={startOver}><IconUsers size={20} /> <span className="dev">नया परिवार पंजीकृत करें</span> Register another family</button>
        </main>
      </div>
    );
  }

  return (
    <div className="civic">
      <BoothTop kiosk={kiosk} titleDev="परिवार पंजीकरण" titleEn="Register a family" />
      <main className="civic-main civic-tight">
        <div className="civic-head">
          <h1><span className="dev">अपने परिवार को पंजीकृत करें</span><span className="en">Register your family</span></h1>
          <p>
            <span className="dev">एक साथ चल रहे सभी लोगों को जोड़ें। बिछड़ने पर कोई भी बूथ मिनटों में आपको मिला देगा।</span><br />
            Add everyone travelling together. If you get separated, any booth can reunite you in minutes.
          </p>
        </div>

        <section className="block">
          <div className="block-head">
            <span className="block-num"><IconPhone size={18} /></span>
            <h2><span className="dev">संपर्क नंबर</span><span className="en">One contact number</span></h2>
          </div>
          <Field dev="मोबाइल नंबर" en="Mobile number" required hint="A booth will call this number the moment a separated member is found.">
            <input className="input" type="tel" inputMode="numeric" placeholder="+91 —" value={draft.contact} onChange={(e) => setField({ contact: e.target.value })} />
          </Field>
          <div className="note"><IconShield size={18} /><span><span className="dev">आपका नंबर सुरक्षित है</span> · Your number is kept private and used only to reunite you.</span></div>
        </section>

        <section className="block">
          <div className="block-head">
            <span className="block-num"><IconUsers size={18} /></span>
            <h2><span className="dev">साथ चल रहे लोग</span><span className="en">People in your group</span></h2>
          </div>
          <p className="hint"><span className="dev">हर व्यक्ति की साफ़ चेहरे की फ़ोटो सबसे तेज़ पहचान है।</span> A clear face photo is the fastest way to identify someone.</p>
          <div className="members">
            {members.map((m, i) => (
              <div className="member" key={m.id}>
                <div className="member-compact">
                  <PhotoCapture value={m.photo} onChange={(url) => setPhoto(m.id, url)} />
                  <div className="member-fields">
                    <div className="member-row">
                      <span className="nm">{m.name.trim() || (i === 0 ? "You" : `Person ${i + 1}`)}</span>
                      {members.length > 1 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => removeMember(m.id)} aria-label="Remove person"><IconX size={18} /></button>
                      )}
                    </div>
                    <Field dev="नाम" en="Name" required={i === 0}>
                      <input className="input" value={m.name} placeholder={i === 0 ? "Your name" : "Their name"} onChange={(e) => patchMember(m.id, { name: e.target.value })} />
                    </Field>
                    <div className="field">
                      <span className="field-label"><span className="field-label-text"><span className="dev">संबंध</span><span className="en">Relation</span></span></span>
                      <div className="chips">
                        {RELATIONS.map((r) => (
                          <button key={r.en} type="button" className="chip-toggle" aria-pressed={m.relation === r.en} onClick={() => patchMember(m.id, { relation: r.en })}><span className="dev">{r.dev}</span> {r.en}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="add-member" onClick={addMember}><IconUsers size={20} /> <span className="dev">व्यक्ति जोड़ें</span> Add a person</button>
          </div>
        </section>
      </main>

      <div className="savebar">
        <div className="savebar-inner">
          <SyncIndicator state={sync} />
          <button className="btn btn-ink" disabled={!canSubmit} onClick={createToken}><IconCheck size={20} /> <span className="dev">परिवार आईडी बनाएँ</span> Create family ID</button>
        </div>
      </div>
    </div>
  );
}
