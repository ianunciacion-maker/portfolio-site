import type { SkillCategory } from "@/types";

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Automation",
    skills: [
      { name: "n8n" },
      { name: "Zapier" },
      { name: "GoHighLevel" },
      { name: "Make" },
    ],
  },
  {
    name: "AI, Prompts & Voice",
    skills: [
      { name: "Claude Code" },
      { name: "OpenAI" },
      { name: "Prompt Engineering" },
      { name: "ElevenLabs" },
      { name: "Antigravity" },
      { name: "OpenClaw" },
    ],
  },
  {
    name: "Development",
    skills: [
      { name: "Next.js" },
      { name: "React" },
      { name: "TypeScript" },
      { name: "VSCode" },
      { name: "Supabase" },
      { name: "Node.js" },
    ],
  },
  {
    name: "Creative & Tools",
    skills: [
      { name: "Remotion" },
      { name: "Airtable" },
      { name: "Bitrix24" },
      { name: "Vercel" },
    ],
  },
];
