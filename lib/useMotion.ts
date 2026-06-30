"use client";
// 🏃 useMotion — samples the phone's accelerometer + gyroscope (DeviceMotionEvent),
// classifies activity every few seconds, and logs a passive `movement` event.
// iOS 13+ needs a user gesture → call start() from a button. Android/desktop attach directly.
import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeMotion, type MotionReading, type MotionResult } from "./tools/motion";
import * as memory from "./memory";
import type { Event } from "./types";

const SAMPLE_HZ = 20;
const WINDOW_MS = 4000; // classify every 4 s

type MotionPermission = "unknown" | "granted" | "denied" | "unsupported";

export function useMotion(opts: { logEvents?: boolean } = {}) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<MotionPermission>("unknown");
  const [result, setResult] = useState<MotionResult | null>(null);
  const [active, setActive] = useState(false);

  const buf = useRef<MotionReading[]>([]);
  const lastFlush = useRef<number>(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "DeviceMotionEvent" in window);
  }, []);

  const onMotion = useCallback(
    (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const rr = e.rotationRate;
      const rot = rr ? Math.abs(rr.alpha ?? 0) + Math.abs(rr.beta ?? 0) + Math.abs(rr.gamma ?? 0) : 0;
      buf.current.push({ mag, rot });

      const now = Date.now();
      if (now - lastFlush.current >= WINDOW_MS && buf.current.length >= 8) {
        const res = analyzeMotion(buf.current, SAMPLE_HZ);
        setResult(res);
        if (opts.logEvents && res.activity !== "still") {
          const ev: Event = {
            ts: now,
            type: "movement",
            source: "passive",
            value: { activity: res.activity, steps: res.steps, cadenceHz: res.cadenceHz },
          };
          memory.append(memory.KEYS.events, ev);
        }
        buf.current = [];
        lastFlush.current = now;
      }
    },
    [opts.logEvents]
  );

  const start = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setPermission("unsupported");
      return;
    }
    // iOS permission gate
    const DME = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DME.requestPermission === "function") {
      try {
        const res = await DME.requestPermission();
        setPermission(res);
        if (res !== "granted") return;
      } catch {
        setPermission("denied");
        return;
      }
    } else {
      setPermission("granted"); // Android / desktop: no explicit gate
    }
    lastFlush.current = Date.now();
    window.addEventListener("devicemotion", onMotion);
    setActive(true);
  }, [onMotion]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined") window.removeEventListener("devicemotion", onMotion);
    setActive(false);
  }, [onMotion]);

  useEffect(() => () => stop(), [stop]);

  return { supported, permission, result, active, start, stop };
}
