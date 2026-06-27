"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Brand } from "./brand";

/* ============================================================ ICONS ============================================================ */
type IconProps = { size?: number };
const s = (n = 22) => ({ width: n, height: n, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconCamera = ({ size }: IconProps) => (<svg {...s(size)}><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.4" /></svg>);
export const IconCheck = ({ size }: IconProps) => (<svg {...s(size)}><path d="M20 6L9 17l-5-5" /></svg>);
export const IconX = ({ size }: IconProps) => (<svg {...s(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconUser = ({ size }: IconProps) => (<svg {...s(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>);
export const IconUsers = ({ size }: IconProps) => (<svg {...s(size)}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>);
export const IconPhone = ({ size }: IconProps) => (<svg {...s(size)}><path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>);
export const IconLock = ({ size }: IconProps) => (<svg {...s(size)}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>);
export const IconSearch = ({ size }: IconProps) => (<svg {...s(size)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" /></svg>);
export const IconPin = ({ size }: IconProps) => (<svg {...s(size)}><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0116 0z" /><circle cx="12" cy="10" r="3" /></svg>);
export const IconMerge = ({ size }: IconProps) => (<svg {...s(size)}><path d="M7 4v6a5 5 0 0010 0V4" /><path d="M12 15v5" /></svg>);
export const IconShield = ({ size }: IconProps) => (<svg {...s(size)}><path d="M12 3l8 4v5c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V7z" /><path d="M9 12l2 2 4-4" /></svg>);
export const IconAlert = ({ size }: IconProps) => (<svg {...s(size)}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>);
export const IconText = ({ size }: IconProps) => (<svg {...s(size)}><path d="M4 6h16M4 12h16M4 18h10" /></svg>);
export const IconArrow = ({ size }: IconProps) => (<svg {...s(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconBack = ({ size }: IconProps) => (<svg {...s(size)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>);

/* ============================================================ STATUS PILL ============================================================ */
export type StatusKey = "registered" | "missing" | "found" | "candidate" | "reunited";
const STATUS: Record<StatusKey, { dev: string; en: string; Icon: (p: IconProps) => ReactNode }> = {
  registered: { dev: "पंजीकृत", en: "Registered", Icon: IconUsers },
  missing: { dev: "गुमशुदा", en: "Missing", Icon: IconSearch },
  found: { dev: "मिल गया", en: "Found", Icon: IconCheck },
  candidate: { dev: "संभावित मिलान", en: "Candidate match", Icon: IconMerge },
  reunited: { dev: "पुनर्मिलित", en: "Reunited", Icon: IconShield },
};
export function Pill({ status, small }: { status: StatusKey; small?: boolean }) {
  const { dev, en, Icon } = STATUS[status];
  return (
    <span className={`pill pill-${status}${small ? " pill-sm" : ""}`}>
      <Icon size={small ? 14 : 16} />
      <span className="pill-dev">{dev}</span>
      <span className="pill-en">{en}</span>
    </span>
  );
}

/* ============================================================ FIELD ============================================================ */
export function Field({
  dev, en, required, optional, hint, children,
}: { dev: string; en: string; required?: boolean; optional?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">
        <span className="field-label-text"><span className="dev">{dev}</span><span className="en">{en}</span></span>
        {required && <span className="req" aria-label="required">●</span>}
        {optional && <span className="opt"><span className="dev">वैकल्पिक</span> Optional</span>}
      </span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

/* ============================================================ AUTOSAVE ============================================================ */
export type SyncState = "idle" | "saving" | "saved";
export function useDraft<T extends object>(key: string, initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const [sync, setSync] = useState<SyncState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // One-time hydration from device storage after mount; a useState
      // initializer would run on the server and break SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDraft((d) => ({ ...d, ...(JSON.parse(raw) as Partial<T>) }));
    } catch { /* ignore corrupt draft */ }
  }, [key]);

  const setField = useCallback((patch: Partial<T>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      setSync("saving");
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* quota */ }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setSync("saved"), 400);
      return next;
    });
  }, [key]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    setDraft(initial);
    setSync("idle");
  }, [key, initial]);

  return { draft, setField, sync, clearDraft };
}

export function SyncIndicator({ state }: { state: SyncState }) {
  if (state === "idle") return (
    <span className="sync sync-idle"><IconLock size={15} /><span><span className="dev">ऑफ़लाइन भी सुरक्षित</span><span className="en">Saved on this device · works offline</span></span></span>
  );
  if (state === "saving") return (
    <span className="sync sync-saving"><span className="spinner" aria-hidden /><span><span className="dev">सहेजा जा रहा है…</span><span className="en">Saving…</span></span></span>
  );
  return (
    <span className="sync sync-saved"><IconCheck size={15} /><span><span className="dev">इस डिवाइस पर सहेजा गया</span><span className="en">Saved on this device</span></span></span>
  );
}

/* ============================================================ PHOTO CAPTURE ============================================================ */
export function PhotoCapture({
  value, onChange, required, big,
}: { value: string | null; onChange: (dataUrl: string | null) => void; required?: boolean; big?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }
  return (
    <div className={`photo${big ? " photo-big" : ""}${value ? " photo-filled" : ""}`}>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={pick} hidden />
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Captured photo of the person" />
          <div className="photo-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}><IconCamera size={18} /> <span className="dev">बदलें</span> Retake</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}><IconX size={18} /> Remove</button>
          </div>
        </>
      ) : (
        <button type="button" className="photo-empty" onClick={() => inputRef.current?.click()}>
          <span className="photo-ico"><IconCamera size={big ? 38 : 30} /></span>
          <span className="photo-lab"><span className="dev">फ़ोटो लें या अपलोड करें</span><span className="en">Take or upload a photo</span></span>
          {required && <span className="photo-req"><span className="dev">सबसे ज़रूरी</span> Most important</span>}
        </button>
      )}
    </div>
  );
}

/* ============================================================ SECTOR MAP ============================================================ */
export function SectorMap({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div className="sectors" role="group" aria-label="Choose a sector">
      {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" className="sector" aria-pressed={value === n} onClick={() => onChange(n)}>{n}</button>
      ))}
    </div>
  );
}

/* ============================================================ STEPS ============================================================ */
export function Steps({ current, labels }: { current: number; labels: { dev: string; en: string }[] }) {
  return (
    <ol className="steps" aria-label={`Step ${current} of ${labels.length}`}>
      {labels.map((l, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "now" : "todo";
        return (
          <li key={n} className={`step step-${state}`}>
            <span className="step-dot">{state === "done" ? <IconCheck size={16} /> : n}</span>
            <span className="step-txt"><span className="dev">{l.dev}</span><span className="en">{l.en}</span></span>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================ BOOTH / CIVIC HEADER ============================================================ */
export function BoothTop({ kiosk, titleDev, titleEn }: { kiosk: boolean; titleDev: string; titleEn: string }) {
  return (
    <header className="civic-top">
      <Brand size={40} home={!kiosk} />
      <div className="civic-top-right">
        <span className="civic-title"><span className="dev">{titleDev}</span><span className="en">{titleEn}</span></span>
        {kiosk && <span className="kiosk-chip"><IconLock size={15} /> <span className="dev">कियोस्क</span> Kiosk</span>}
      </div>
    </header>
  );
}
