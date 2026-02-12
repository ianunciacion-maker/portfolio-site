"use client";

import { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン+-*/<>=~@#$%&";

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  chars: string[];
  accumulator: number;
}

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function createDrop(x: number, maxRows: number, isMobile: boolean): Drop {
  const length = isMobile
    ? Math.floor(Math.random() * 5) + 4
    : Math.floor(Math.random() * 7) + 5;

  const speed = isMobile
    ? Math.random() * 0.02 + 0.03
    : Math.random() * 0.03 + 0.03;

  const opacity = isMobile
    ? Math.random() * 0.15 + 0.15
    : Math.random() * 0.2 + 0.2;

  return {
    x,
    y: -Math.floor(Math.random() * maxRows),
    speed,
    length,
    opacity,
    chars: Array.from({ length }, () => randomChar()),
    accumulator: 0,
  };
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const animationRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  const initDrops = useCallback((width: number, height: number) => {
    const isMobile = width < 768;
    const columns = isMobile ? 20 : 40;
    const cellSize = isMobile ? 12 : 14;
    const maxRows = Math.ceil(height / cellSize);
    const spacing = width / columns;

    const drops: Drop[] = [];
    for (let i = 0; i < columns; i++) {
      const x = spacing * i + spacing / 2;
      drops.push(createDrop(x, maxRows, isMobile));
    }
    dropsRef.current = drops;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const isMobile = canvas.width < 768;
      const cellSize = isMobile ? 12 : 14;
      const maxRows = Math.ceil(canvas.height / cellSize);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${cellSize}px monospace`;
      ctx.textAlign = "center";

      dropsRef.current.forEach((drop) => {
        drop.accumulator += drop.speed;

        if (drop.accumulator >= 1.0) {
          drop.accumulator -= 1.0;
          drop.y += 1;
          // Rotate chars: shift first char off, add new random at end
          drop.chars.shift();
          drop.chars.push(randomChar());
        }

        // Draw trail
        for (let j = 0; j < drop.length; j++) {
          const row = drop.y - j;
          if (row < 0 || row >= maxRows) continue;

          const charOpacity = drop.opacity * (1 - j / drop.length);
          if (charOpacity < 0.005) continue;

          const rgb = themeRef.current === "dark" ? "255, 255, 255" : "0, 0, 0";
          ctx.fillStyle = `rgba(${rgb}, ${charOpacity})`;
          ctx.fillText(drop.chars[j] ?? randomChar(), drop.x, row * cellSize);
        }

        // Reset when entire trail exits viewport
        if (drop.y - drop.length > maxRows) {
          const reset = createDrop(drop.x, maxRows, isMobile);
          reset.x = drop.x; // keep same column
          Object.assign(drop, reset);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [reducedMotion, initDrops]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
