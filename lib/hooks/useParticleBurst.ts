"use client";

import { useCallback, useRef } from "react";

interface ParticleBurstConfig {
  count: number;
  colors: string[];
  sizeRange: [number, number];
  gravity: number;
  durationMs: number;
  spread?: "burst" | "full-width";
  flashOverlay?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

export function useParticleBurst(
  originRef: React.RefObject<HTMLElement | null>,
  config: ParticleBurstConfig
): { fire: () => void } {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fire = useCallback(() => {
    // Get origin position
    let originX = window.innerWidth / 2;
    let originY = 0;

    if (config.spread !== "full-width" && originRef.current) {
      const rect = originRef.current.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }

    // Flash overlay
    if (config.flashOverlay) {
      const flash = document.createElement("div");
      flash.style.cssText = `
        position: fixed; inset: 0; z-index: 9998;
        background-color: rgba(36, 36, 36, 0.04);
        pointer-events: none;
      `;
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 150);
    }

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      pointer-events: none; width: 100vw; height: 100vh;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < config.count; i++) {
      const angle = config.spread === "full-width"
        ? Math.random() * Math.PI * 0.6 + Math.PI * 0.2 // downward spread
        : Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: config.spread === "full-width"
          ? Math.random() * window.innerWidth
          : originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: config.spread === "full-width"
          ? Math.abs(Math.sin(angle)) * speed
          : -Math.abs(Math.sin(angle)) * speed * 1.5,
        size: config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: 1,
      });
    }

    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      if (elapsed > config.durationMs || !ctx) {
        canvas.remove();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fadeStart = config.durationMs * 0.6;
      for (const p of particles) {
        p.x += p.vx;
        p.vy += config.gravity;
        p.y += p.vy;
        if (elapsed > fadeStart) {
          p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (config.durationMs - fadeStart));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [config, originRef]);

  return { fire };
}
