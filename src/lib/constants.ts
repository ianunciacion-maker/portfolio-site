import type { NavItem, SocialLink } from "@/types";

export const SITE_CONFIG = {
  name: "Ian Anunciacion",
  title: "Ian Anunciacion | Automations Expert & Vibe Coder",
  description:
    "Results-driven Automations Expert, Prompt Engineer, and Vibe Coder with 13+ years of experience. I build end-to-end automation systems, craft production-grade AI prompts, and develop modern web applications that help businesses scale.",
  url: "https://iananunciacion.com",
  ogImage: "/og-image.png",
} as const;

export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Email",
    href: "mailto:ianjoseph.anunciacion@gmail.com",
    icon: "Mail",
  },
  {
    label: "Phone",
    href: "tel:+639184692844",
    icon: "Phone",
  },
];
