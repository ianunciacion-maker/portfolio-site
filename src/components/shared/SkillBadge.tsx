"use client";

import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";

interface SkillBadgeProps {
  name: string;
}

export function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <GlassCard padding="sm" className="flex items-center justify-center text-center min-h-[60px]">
        <span className="text-sm font-medium text-text-primary">{name}</span>
      </GlassCard>
    </motion.div>
  );
}
