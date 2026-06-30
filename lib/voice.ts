"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Voice (Web Speech API) — STT + TTS. Ported/adapted from Appily's VoiceInput. Owned by Session 1.
// Web Speech types aren't in the TS DOM lib, so `any` is used intentionally here.
import { useCallback, useEffect, useRef, useState } from "react";

export function useVoice() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SRClass =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SRClass) setSupported(false);
  }, []);

  const start = useCallback((lang = "en-US") => {
    const SRClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SRClass) {
      setSupported(false);
      return;
    }
    const rec = new SRClass();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    recRef.current = rec;
    setTranscript("");
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  const speak = useCallback((text: string, lang = "en-US") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.97;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { listening, speaking, transcript, supported, start, stop, speak, stopSpeaking };
}
