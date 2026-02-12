"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "motion/react";

interface SuccessConfettiProps {
  trigger: boolean;
  originRef?: React.RefObject<HTMLElement | null>;
}

const colors = ["#60a5fa", "#34d399", "#a78bfa", "#fbbf24", "#f87171", "#818cf8"];

export function SuccessConfetti({ trigger, originRef }: SuccessConfettiProps) {
  const hasFiredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!trigger || hasFiredRef.current || prefersReducedMotion) return;
    hasFiredRef.current = true;

    const getOrigin = () => {
      if (originRef?.current) {
        const rect = originRef.current.getBoundingClientRect();
        return {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        };
      }
      return { x: 0.5, y: 0.5 };
    };

    const fire = (delay: number, opts: confetti.Options) => {
      setTimeout(() => {
        const origin = getOrigin();
        confetti({
          origin,
          colors,
          disableForReducedMotion: true,
          ...opts,
        });
      }, delay);
    };

    // Delay all bursts 400ms to let the success container animate in first
    fire(400, { particleCount: 60, spread: 70, startVelocity: 35, decay: 0.91, scalar: 1 });
    fire(550, { particleCount: 40, spread: 100, startVelocity: 50, decay: 0.88, scalar: 0.9 });
    fire(750, { particleCount: 30, spread: 120, startVelocity: 20, decay: 0.94, scalar: 0.8 });
  }, [trigger, prefersReducedMotion, originRef]);

  return null;
}
