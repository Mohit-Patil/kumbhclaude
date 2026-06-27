"use client";

import { useEffect, useRef, useState } from "react";

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A9690" strokeWidth="1.9" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <circle cx="12" cy="12.5" r="3.2" />
      <path d="M8 6l1.5-2h5L16 6" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v12" />
    </svg>
  );
}
function FlipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 0115.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 01-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function CameraModal({
  name,
  onClose,
  onCapture,
}: {
  name: string;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const video = videoRef.current;
    const media = navigator.mediaDevices;

    (async () => {
      try {
        // `await` first so the no-support path rejects asynchronously too —
        // every setState below runs after an await, never synchronously in the effect.
        const stream = await (media?.getUserMedia
          ? media.getUserMedia({
              video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
              audio: false,
            })
          : Promise.reject(new DOMException("unsupported", "NotFoundError")));
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        if (active) {
          setReady(true);
          setError(null);
        }
      } catch (e) {
        if (!active) return;
        const name = e instanceof DOMException ? e.name : "";
        setError(
          name === "NotAllowedError"
            ? "Camera access is blocked. Allow the camera in your browser, or choose a photo from the device."
            : "No camera was found. Choose a photo from the device instead.",
        );
      }
    })();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const ratio = 3 / 4; // portrait, width / height
    let sw = vw;
    let sh = vh;
    let sx = 0;
    let sy = 0;
    if (vw / vh > ratio) {
      sw = vh * ratio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / ratio;
      sy = (vh - sh) / 2;
    }
    const outW = 720;
    const outH = 960;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      // mirror so the saved photo matches the mirrored preview
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="cam-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Take a photo of ${name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cam-sheet">
        <div className="cam-head">
          <div className="cam-title">
            Photo <span className="hi">{name}</span>
          </div>
          <button type="button" className="cam-x" onClick={onClose} aria-label="Close camera">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="cam-stage">
          {error ? (
            <div className="cam-error">
              <CameraIcon />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className={`cam-video${facing === "user" ? " mir" : ""}`}
                playsInline
                muted
                autoPlay
              />
              {!ready && <div className="cam-loading">Starting camera…</div>}
            </>
          )}
        </div>

        <div className="cam-actions">
          {error ? (
            <label className="btn btn-primary btn-block">
              Choose a photo
              <input type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
            </label>
          ) : (
            <>
              <button
                type="button"
                className="cam-side"
                onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                aria-label="Flip camera"
              >
                <FlipIcon />
              </button>
              <button
                type="button"
                className="cam-shutter"
                onClick={capture}
                disabled={!ready}
                aria-label={`Capture photo of ${name}`}
              >
                <span />
              </button>
              <label className="cam-side" aria-label="Choose a photo from the device">
                <FileIcon />
                <input type="file" accept="image/*" hidden onChange={onFile} />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PhotoCapture({
  name,
  uploadOnly = false,
  fieldName,
  className = "",
}: {
  name?: string;
  uploadOnly?: boolean;
  /** When set, the captured image (a data URL) is submitted under this form field. */
  fieldName?: string;
  /** Extra classes for the box, e.g. "photo-big" for the portrait sizing. */
  className?: string;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const label = name?.trim() ?? "";
  const first = label ? label.split(" ")[0] : "Photo";
  const subject = label || "this person";

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  const inner = photo ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="shot-img" src={photo} alt={`Photo of ${subject}`} />
      <span className="shot-badge" aria-hidden>
        <CheckIcon />
      </span>
      <span className="shot-cap">{first} · {uploadOnly ? "change" : "retake"}</span>
    </>
  ) : (
    <>
      {uploadOnly ? <FileIcon /> : <CameraIcon />}
      <span className="lab">
        {uploadOnly ? "Upload photo" : "Add photo"}
        {label && (
          <>
            <br />
            {label}
          </>
        )}
      </span>
    </>
  );

  // Carries the captured image (data URL) into the surrounding <form> so a
  // server action can persist it. Rendered only when a field name is given.
  const hiddenField = fieldName ? <input type="hidden" name={fieldName} value={photo ?? ""} /> : null;

  // Upload-only: a label wrapping a hidden file input opens the device picker
  // directly — no live camera modal.
  if (uploadOnly) {
    return (
      <label
        className={`shot${photo ? " done" : ""}${className ? " " + className : ""}`}
        aria-label={photo ? `Change photo of ${subject}` : `Upload a photo of ${subject}`}
      >
        {inner}
        <input type="file" accept="image/*" hidden onChange={onFile} />
        {hiddenField}
      </label>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`shot${photo ? " done" : ""}${className ? " " + className : ""}`}
        onClick={() => setOpen(true)}
        aria-label={photo ? `Retake photo of ${subject}` : `Add a photo of ${subject}`}
      >
        {inner}
      </button>
      {hiddenField}
      {open && (
        <CameraModal
          name={subject}
          onClose={() => setOpen(false)}
          onCapture={(data) => {
            setPhoto(data);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
