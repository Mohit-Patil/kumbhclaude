"use client";

import { useState } from "react";
import { PhotoCapture } from "./photo-capture";

type Member = {
  id: number;
  name: string;
  relation: string;
  age: string;
};

const RELATIONS = [
  "Spouse",
  "Son",
  "Daughter",
  "Mother",
  "Father",
  "Brother",
  "Sister",
  "Grandmother",
  "Grandfather",
  "Other",
];

function tagFor(age: string): { label: string; cls: "missing" | "ghost" } | null {
  const n = Number(age);
  if (!age || Number.isNaN(n)) return null;
  if (n < 12) return { label: "Child", cls: "missing" };
  if (n >= 65) return { label: "Elder", cls: "ghost" };
  return null;
}

let seq = 0;

export function FamilyMembers() {
  const [members, setMembers] = useState<Member[]>([]);

  const add = () => setMembers((m) => [...m, { id: ++seq, name: "", relation: "", age: "" }]);
  const remove = (id: number) => setMembers((m) => m.filter((x) => x.id !== id));
  const update = (id: number, patch: Partial<Member>) =>
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <div className="people">
      <p className="hint">
        Add each person travelling with you. A clear face photo is the fastest way to match someone who is found.
      </p>

      {members.length === 0 && (
        <div className="people-empty">No one added yet — tap “Add a person” to begin.</div>
      )}

      {members.map((mem) => {
        const tag = tagFor(mem.age);
        return (
          <div className="member" key={mem.id}>
            <div className="member-photo">
              <PhotoCapture name={mem.name} />
            </div>
            <div className="member-fields">
              <div className="member-top">
                <input
                  className="input"
                  placeholder="Full name"
                  value={mem.name}
                  onChange={(e) => update(mem.id, { name: e.target.value })}
                  aria-label="Family member name"
                />
                <button
                  type="button"
                  className="member-remove"
                  onClick={() => remove(mem.id)}
                  aria-label={`Remove ${mem.name || "this person"}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
              <div className="member-row">
                <select
                  className="input select"
                  value={mem.relation}
                  onChange={(e) => update(mem.id, { relation: e.target.value })}
                  aria-label="Relation to head of family"
                >
                  <option value="">Relation</option>
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  className="input mono"
                  placeholder="Age"
                  inputMode="numeric"
                  value={mem.age}
                  onChange={(e) => update(mem.id, { age: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                  aria-label="Age"
                />
                {tag && (
                  <span className={`chip ${tag.cls}`}>
                    {tag.cls === "missing" && <span className="dot" />}
                    {tag.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button type="button" className="addp" onClick={add}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A574B" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add a person{" "}
        <span className="hi" style={{ fontWeight: 500, color: "var(--ink-faint)" }}>
          व्यक्ति जोड़ें
        </span>
      </button>
    </div>
  );
}
