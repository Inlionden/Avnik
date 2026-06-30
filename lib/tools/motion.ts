// 🏃 Motion tools — classify activity from phone IMU (accelerometer + gyroscope).
// Pure + deterministic so it can be unit-tested without a device.
// The client hook (lib/hooks/useMotion.ts) samples DeviceMotionEvent and feeds these.

export type Activity = "still" | "sitting" | "walking" | "stairs" | "running" | "turning";

/** One IMU sample. mag = |acceleration| (m/s², gravity included). rot = total rotation rate (deg/s, optional). */
export type MotionReading = { mag: number; rot?: number };

export type MotionResult = {
  activity: Activity;
  steps: number;       // steps detected in this window
  cadenceHz: number;   // step frequency
  intensity: number;   // 0–1 movement intensity
  stdev: number;       // raw magnitude std-dev (debug)
};

/**
 * Classify a window of IMU readings into an activity + step count.
 * Strategy: gravity is removed via mean-detrending; step cadence comes from
 * threshold crossings of the dynamic (de-gravitied) signal; the activity ladder
 * uses magnitude variance + cadence + rotation rate.
 */
export function analyzeMotion(readings: MotionReading[], sampleHz = 20): MotionResult {
  if (readings.length < 4) {
    return { activity: "still", steps: 0, cadenceHz: 0, intensity: 0, stdev: 0 };
  }

  const mags = readings.map((r) => r.mag);
  const mean = mags.reduce((s, v) => s + v, 0) / mags.length;
  const variance = mags.reduce((s, v) => s + (v - mean) ** 2, 0) / mags.length;
  const std = Math.sqrt(variance);

  // Dynamic acceleration (gravity removed) → step peak detection.
  const dyn = mags.map((v) => v - mean);
  const thr = Math.max(0.6, std * 0.5); // adaptive threshold
  let steps = 0;
  for (let i = 1; i < dyn.length; i++) {
    if (dyn[i - 1] < thr && dyn[i] >= thr) steps++; // rising edge = one step
  }

  const durationSec = readings.length / sampleHz;
  const cadenceHz = durationSec > 0 ? steps / durationSec : 0;
  const avgRot = readings.reduce((s, r) => s + (r.rot ?? 0), 0) / readings.length;

  let activity: Activity;
  if (avgRot > 90 && std < 2.5) {
    activity = "turning";                      // gyroscope-dominated, little translation
  } else if (std < 0.35) {
    activity = "still";                        // phone on a surface
  } else if (std < 1.0) {
    activity = "sitting";                      // held / small fidgets
  } else if (std > 6 || cadenceHz > 2.6) {
    activity = "running";
  } else if (std >= 3.2 && cadenceHz >= 1.2 && cadenceHz <= 2.6) {
    activity = "stairs";                       // walking cadence but bigger vertical jolt
  } else if (cadenceHz >= 1.2 && cadenceHz <= 2.6) {
    activity = "walking";
  } else {
    activity = "sitting";
  }

  return {
    activity,
    steps,
    cadenceHz: +cadenceHz.toFixed(2),
    intensity: Math.min(1, +(std / 8).toFixed(2)),
    stdev: +std.toFixed(2),
  };
}

/** Map an activity to a one-line wellbeing/productivity note (used by Sentinel). */
export function motionNote(r: MotionResult): string {
  switch (r.activity) {
    case "walking": return `Walking (~${r.steps} steps). Movement boosts focus — good pre-work primer.`;
    case "running": return `Running detected. Endorphins up — a great window for a hard task afterwards.`;
    case "stairs":  return `Climbing stairs. Quick cardio break — you'll come back sharper.`;
    case "turning": return `Lots of turning/restlessness — possible agitation. A 2-min breathing reset may help.`;
    case "sitting": return `Sitting still for a while. If it's been >50 min, stand and stretch to protect focus.`;
    case "still":   return `Phone is stationary — likely away from you or on a surface.`;
  }
}
