"use client";

import { useEffect } from "react";

/**
 * Registers the minimal service worker in production for PWA installability.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability is best-effort; ignore registration failures.
    });
  }, []);

  return null;
}
