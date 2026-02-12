"use client";

import { motion } from "motion/react";

const easing = [0.25, 0.46, 0.45, 0.94] as const;

export function AnimatedCheckmark({ className }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: easing, delay: 0.1 }}
    >
      {/* Circle */}
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: easing, delay: 0.2 }}
      />
      {/* Check stroke */}
      <motion.path
        d="M15 27l7 7 15-15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: easing, delay: 0.6 }}
      />
    </motion.svg>
  );
}
