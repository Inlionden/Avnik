"use client";
import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Only register the SW in production — in dev it intercepts and breaks
    // RSC payload fetches ("Failed to fetch RSC payload"). Unregister any
    // stale SW left over from a previous dev session.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then(regs =>
        regs.forEach(r => r.unregister())
      ).catch(() => {});
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore — PWA is progressive enhancement */
    });
  }, []);
  return null;
}
