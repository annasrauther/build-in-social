"use client";

import { useCallback, useRef } from "react";

/**
 * Premium interaction feedback: synthesized Web Audio sounds + haptic vibration.
 * Sounds are generated in-browser via Web Audio API — no network requests, no files.
 * Haptics use navigator.vibrate() where available (Android browsers, some iOS PWAs).
 */
export function useInteractionFeedback() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const Ctor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }

  const playTone = useCallback(
    (
      freq: number,
      duration: number,
      volume = 0.07,
      type: OscillatorType = "sine",
      freqEnd?: number,
    ) => {
      const ctx = getCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (freqEnd !== undefined) {
        osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.01);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Selection confirmed — two-tone ascending click (premium feel) */
  const playSelect = useCallback(() => {
    playTone(880, 0.055, 0.07);
    setTimeout(() => playTone(1320, 0.045, 0.055), 55);
  }, [playTone]);

  /** Item deselected — single lower tone */
  const playDeselect = useCallback(() => {
    playTone(440, 0.07, 0.055);
  }, [playTone]);

  /** Page navigation / continue — ascending frequency sweep */
  const playNavigation = useCallback(() => {
    playTone(440, 0.13, 0.07, "sine", 880);
  }, [playTone]);

  /** Confirm / completion — three ascending tones */
  const playConfirm = useCallback(() => {
    playTone(660, 0.06, 0.07);
    setTimeout(() => playTone(880, 0.06, 0.07), 80);
    setTimeout(() => playTone(1100, 0.09, 0.08), 160);
  }, [playTone]);

  /** Error / unavailable — descending low tone */
  const playError = useCallback(() => {
    playTone(300, 0.1, 0.06, "sine", 220);
  }, [playTone]);

  /** Haptic vibration. Patterns: number = single pulse ms, number[] = on/off pattern */
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently ignore — vibrate is best-effort
      }
    }
  }, []);

  return {
    playSelect,
    playDeselect,
    playNavigation,
    playConfirm,
    playError,
    vibrate,
  };
}
