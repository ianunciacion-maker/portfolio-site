"use client";

import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

export function ProjectDetailClient({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export function MarkdownDescription({ content }: { content: string }) {
  return (
    <div className="mt-6 text-text-secondary leading-relaxed text-lg prose-description">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
