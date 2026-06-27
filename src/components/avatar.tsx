"use client";

import { useState } from "react";
import { Silhouette } from "./brand";

/** Renders a person's portrait; falls back to the silhouette if it fails to load. */
export function Avatar({ url, size = 22 }: { url?: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt=""
        className="avatar-img"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return <Silhouette size={size} />;
}
