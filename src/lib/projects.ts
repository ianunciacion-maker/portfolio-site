import type { Project, ProjectCategory } from "@/types";

export const PROJECTS: Project[] = [
  {
    slug: "closepilot-crm",
    title: "ClosePilot",
    shortDescription:
      "Full-stack CRM for real estate agents with MLS integration, Zillow/Realtor.com lead routing, deal pipeline management, and AI-powered lead scoring.",
    fullDescription: `Most real estate CRMs are bloated, expensive, and built for enterprise brokerages — not individual agents hustling to close deals. ClosePilot is a purpose-built CRM designed from the ground up for solo agents and small teams who need a fast, modern tool that actually fits their workflow.

### Key Features

- **MLS Integration** — Connects directly to MLS via the RESO Web API for live listing data, auto-matching leads to properties
- **Lead Routing** — Pulls leads automatically from Zillow Premier Agent and Realtor.com ReadyConnect, with configurable round-robin or claim-based assignment
- **Kanban Deal Pipeline** — Visual board tracking every transaction from first contact through closing, with drag-and-drop stage management
- **AI Lead Scoring** — Uses property search behavior and engagement signals to prioritize the hottest leads
- **Automated Drip Campaigns** — Email and Twilio SMS sequences that nurture leads without manual follow-up
- **Transaction Management** — Deadline tracking, document checklists, and e-signature workflows to keep closings on track

### Technical Highlights

The app is built on **Next.js 15** and **React 19** with Supabase handling auth, database, and real-time subscriptions. Stripe powers the subscription billing, and OpenAI runs the lead-scoring model. The calendar integrates with ShowingTime for scheduling property tours.

**Built with:** Next.js, React, Supabase, Tailwind CSS, Twilio, OpenAI, Stripe, MLS/RESO API`,
    category: "web-apps",
    categoryLabel: "Web Apps",
    techStack: [
      "Next.js",
      "React",
      "Supabase",
      "Tailwind CSS",
      "Twilio",
      "OpenAI",
      "Stripe",
      "MLS/RESO API",
    ],
    image: "/images/projects/closepilot-crm.png",
    screenshots: [
      "/images/projects/closepilot-crm-1.png",
      "/images/projects/closepilot-crm-2.png",
      "/images/projects/closepilot-crm-3.png",
      "/images/projects/closepilot-crm-4.png",
      "/images/projects/closepilot-crm-5.png",
      "/images/projects/closepilot-crm-6.png",
      "/images/projects/closepilot-crm-7.png",
    ],
    featured: true,
    order: 1,
  },
  {
    slug: "aia-lead-extractor",
    title: "AIA Lead Extractor",
    shortDescription:
      "AI-powered lead extraction tool that scrapes, enriches, and manages B2B leads with automated reporting.",
    fullDescription: `Finding quality B2B leads shouldn't mean hours of manual research and spreadsheet wrangling. AIA Lead Extractor automates the entire pipeline — from scraping prospect data off the web to enriching it with contact details and delivering clean, actionable reports.

### Key Features

- **Automated Scraping** — Runs Apify actors to extract leads from targeted websites and directories at scale
- **Lead Enrichment** — Augments raw scraped data with verified emails, phone numbers, and company info
- **Campaign Reports** — Generates detailed extraction reports with filtering, sorting, and export to CSV
- **Dashboard Analytics** — Real-time overview of extraction runs, lead counts, and campaign performance
- **Validation & Scoring** — Zod-powered data validation ensures clean records; AI scoring highlights the best-fit leads

### Technical Highlights

Built with **Next.js 16** and **React 19** on the app router. Supabase handles auth, Postgres storage, and row-level security. Apify orchestrates the scraping infrastructure with webhook callbacks. The UI uses Tailwind CSS v4 with a custom dark theme and fully responsive layout.

**Built with:** Next.js, React, Supabase, Apify, Tailwind CSS, Zod`,
    category: "web-apps",
    categoryLabel: "Web Apps",
    techStack: ["Next.js", "React", "Supabase", "Apify", "Tailwind CSS", "Zod"],
    image: "/images/projects/aia-lead-extractor.png",
    screenshots: [
      "/images/projects/aia-lead-extractor-1.png",
      "/images/projects/aia-lead-extractor-2.png",
      "/images/projects/aia-lead-extractor-3.png",
      "/images/projects/aia-lead-extractor-4.png",
      "/images/projects/aia-lead-extractor-5.png",
    ],
    featured: true,
    order: 4,
  },
  {
    slug: "white-lotus",
    title: "White Lotus",
    shortDescription:
      "Real-time property management application with live data sync and modern state management.",
    fullDescription: `Managing rental properties means juggling tenants, maintenance requests, payments, and inspections — often across multiple units. White Lotus brings it all into one clean, real-time dashboard so property managers can stop chasing spreadsheets and start running their portfolio like a business.

### Key Features

- **Real-Time Sync** — Live data updates powered by Supabase Realtime, so changes reflect instantly across all devices
- **Property Dashboard** — At-a-glance overview of occupancy, rent collection, and maintenance status for every unit
- **Tenant Management** — Track leases, contact info, payment history, and communication logs in one place
- **Maintenance Tracking** — Log requests, assign contractors, and track resolution status with priority levels
- **Authentication** — Secure login with role-based access for owners, managers, and tenants

### Technical Highlights

Built with **React** and **Vite** for fast dev cycles and optimized builds. **React Router v7** handles client-side navigation, **Zustand** manages UI state with minimal boilerplate, and **React Query** keeps server state in sync with automatic background refetching. Supabase provides the full backend — auth, Postgres database, and real-time subscriptions.

**Built with:** React, Supabase, Zustand, React Query, Vite, Tailwind CSS`,
    category: "web-apps",
    categoryLabel: "Web Apps",
    techStack: ["React", "Supabase", "Zustand", "React Query", "Vite", "Tailwind CSS"],
    image: "/images/projects/white-lotus.png",
    screenshots: [
      "/images/projects/white-lotus-1.png",
      "/images/projects/white-lotus-2.png",
      "/images/projects/white-lotus-3.png",
      "/images/projects/white-lotus-4.png",
      "/images/projects/white-lotus-5.png",
    ],
    featured: true,
    order: 5,
  },
  {
    slug: "aiauto",
    title: "aiAuto",
    shortDescription:
      "AI productivity platform helping freelancers and entrepreneurs automate their work and scale their income.",
    fullDescription: `Freelancers and solopreneurs wear every hat — sales, marketing, operations, support. aiAuto is an AI productivity platform that helps them reclaim their time by automating the repetitive work so they can focus on the high-value stuff that actually grows their income.

### Key Features

- **AI Automation Tools** — Pre-built workflows for common freelancer tasks like proposal generation, invoice follow-ups, and client onboarding
- **Resource Hub** — Curated guides and tutorials on leveraging AI for business automation
- **Clean Dashboard** — Simple, distraction-free interface for managing automation workflows
- **Responsive Design** — Works seamlessly across desktop, tablet, and mobile devices

### Technical Highlights

Built with **vanilla JavaScript** and **Node.js** for maximum performance and zero framework overhead. The architecture uses 13 modular JS files with clean separation of concerns — each feature is self-contained and independently maintainable. The frontend is server-rendered for fast initial load times with progressive enhancement for interactivity.

**Built with:** JavaScript, Node.js, HTML5, CSS3`,
    category: "web-apps",
    categoryLabel: "Web Apps",
    techStack: ["JavaScript", "Node.js", "HTML5", "CSS3", "Responsive Design"],
    image: "/images/projects/aiauto.png",
    screenshots: [
      "/images/projects/aiauto-1.png",
      "/images/projects/aiauto-2.png",
      "/images/projects/aiauto-3.png",
      "/images/projects/aiauto-4.png",
      "/images/projects/aiauto-5.png",
    ],
    featured: false,
    order: 6,
  },
  {
    slug: "hr-bot-aia",
    title: "HR Bot AIA",
    shortDescription:
      "AI-powered HR assistant with multilingual chat interface for streamlining human resources workflows.",
    fullDescription: `HR teams spend a huge chunk of their day answering the same questions — vacation policies, benefits enrollment, onboarding checklists. HR Bot AIA is an intelligent chat assistant that handles these routine queries instantly, in both English and Polish, freeing up HR professionals to focus on people, not paperwork.

### Key Features

- **Multilingual Chat** — Full conversational AI support in English and Polish, with automatic language detection
- **HR Knowledge Base** — Pre-trained on common HR policies, procedures, and FAQs for instant, accurate responses
- **Candidate Evaluation** — AI-assisted screening that summarizes resumes and flags key qualifications against job requirements
- **Chat History** — Persistent conversation logs so employees can reference past answers and HR can audit interactions
- **Authentication** — Secure login ensuring only authorized employees access the bot

### Technical Highlights

Built with **React** and **Vite** for a snappy single-page experience. The chat interface uses a streaming response pattern for real-time AI output. Lucide React provides the icon system, and Tailwind CSS handles the responsive layout. The bot connects to an AI backend for natural language understanding with context-aware responses tailored to HR operations.

**Built with:** React, Vite, Tailwind CSS, AI Chat, Lucide React`,
    category: "ai-bots",
    categoryLabel: "AI & Bots",
    techStack: ["React", "Vite", "Tailwind CSS", "AI Chat", "Lucide React"],
    image: "/images/projects/hr-bot-aia.png",
    screenshots: [
      "/images/projects/hr-bot-aia-1.png",
      "/images/projects/hr-bot-aia-2.png",
      "/images/projects/hr-bot-aia-3.png",
      "/images/projects/hr-bot-aia-4.png",
      "/images/projects/hr-bot-aia-5.png",
    ],
    featured: true,
    order: 7,
  },
  {
    slug: "aia-sales-bot",
    title: "AIA Sales Bot",
    shortDescription:
      "AI-powered outbound sales system with voice calling, lead management, and CRM integration via n8n workflows.",
    fullDescription: `Cold outreach is tedious, time-consuming, and hard to scale — especially for small sales teams. AIA Sales Bot automates the entire outbound pipeline end-to-end: qualifying leads, making AI-powered voice calls, and booking meetings on the calendar — all without a human lifting a finger.

### Key Features

- **AI Voice Calls** — Uses ElevenLabs to generate natural-sounding voice calls that engage prospects in real conversation
- **CRM Integration** — Syncs with Bitrix24 for full lead lifecycle management, from initial contact to closed deal
- **Automated Scheduling** — Connects with Calendly to book qualified meetings directly into the sales team's calendar
- **Lead Qualification** — AI evaluates prospect fit based on configurable criteria before initiating outreach
- **Error Handling & Alerts** — Built-in retry logic and notification workflows for failed calls or API issues

### Technical Highlights

The entire system is orchestrated through **n8n workflows** — no traditional application code needed. Multiple workflows handle different stages of the pipeline: lead ingestion, qualification scoring, voice call execution via ElevenLabs API, response analysis, and Calendly booking. JavaScript function nodes handle data transformation between services.

**Built with:** n8n, ElevenLabs, Bitrix24, Calendly, JavaScript`,
    category: "ai-bots",
    categoryLabel: "AI & Bots",
    techStack: ["n8n", "ElevenLabs", "Bitrix24", "Calendly", "JavaScript"],
    image: "/images/projects/aia-sales-bot.png",
    screenshots: [
      "/images/projects/aia-sales-bot-1.png",
      "/images/projects/aia-sales-bot-2.png",
      "/images/projects/aia-sales-bot-3.png",
      "/images/projects/aia-sales-bot-4.png",
      "/images/projects/aia-sales-bot-5.png",
    ],
    featured: true,
    order: 8,
  },
  {
    slug: "rp-partner-website",
    title: "Tuknang.com",
    shortDescription:
      "Property management marketing website for Filipino landlords with programmatic video generation and smooth animations.",
    fullDescription: `Tuknang needed a marketing website that matched the quality of its product — a rental property management app built for Filipino landlords. This site delivers a polished, high-conversion experience with programmatic video, smooth animations, and a modern glassmorphism design that builds trust and drives signups.

### Key Features

- **Programmatic Video** — Hero background and explainer videos generated with Remotion, rendered server-side for pixel-perfect output
- **Scroll Animations** — Smooth entrance effects and parallax sections powered by Framer Motion for a premium feel
- **Glassmorphism UI** — Frosted glass cards, subtle borders, and layered depth create a modern, elevated design language
- **Responsive Layout** — Fully optimized for mobile, tablet, and desktop with fluid typography and adaptive grids
- **Performance Optimized** — Image optimization, lazy loading, and code splitting for fast load times

### Technical Highlights

Built with **Next.js 16** and **React 19** on the app router. Remotion handles programmatic video composition — each video is defined as a React component and rendered to MP4 at build time. Framer Motion manages all scroll-triggered animations with intersection observer hooks. Tailwind CSS v4 provides the styling system with custom design tokens.

**Built with:** Next.js, React, Remotion, Framer Motion, Tailwind CSS`,
    category: "websites-automations",
    categoryLabel: "Websites & Automations",
    techStack: ["Next.js", "React", "Remotion", "Framer Motion", "Tailwind CSS"],
    image: "/images/projects/rp-partner-website.png",
    screenshots: [
      "/images/projects/rp-partner-website-1.png",
      "/images/projects/rp-partner-website-2.png",
      "/images/projects/rp-partner-website-3.png",
      "/images/projects/rp-partner-website-4.png",
      "/images/projects/rp-partner-website-5.png",
    ],
    featured: true,
    order: 9,
  },
  {
    slug: "autonoiq-website",
    title: "AutonoIQ Website",
    shortDescription:
      "AI automation agency marketing website with Supabase backend and modular JavaScript architecture.",
    fullDescription: `AutonoIQ is an AI automation agency, and its website needed to communicate credibility, technical expertise, and a clear value proposition — all while being easy to maintain and update. This site delivers a fast, secure marketing experience with a Supabase-powered backend for dynamic content.

### Key Features

- **Dynamic Content** — Case studies, testimonials, and service descriptions stored in Supabase and rendered dynamically
- **Markdown Rendering** — Rich content sections powered by Marked.js for easy editing without code changes
- **Security First** — All user-generated and dynamic content sanitized with DOMPurify to prevent XSS attacks
- **Modular Architecture** — 13 self-contained JavaScript modules for clean separation of concerns and easy maintenance
- **Responsive Design** — Fully optimized layouts for mobile, tablet, and desktop viewports

### Technical Highlights

Built with **vanilla JavaScript** — no framework overhead, just clean modular code. The backend uses **Supabase** with PostgreSQL for structured data storage and real-time content updates. DOMPurify sanitizes all rendered content for security. Marked.js converts markdown content to HTML for rich text sections. Deployed on **Vercel** with automatic builds and edge caching.

**Built with:** JavaScript, Supabase, HTML5, CSS3, Vercel, DOMPurify`,
    category: "websites-automations",
    categoryLabel: "Websites & Automations",
    techStack: ["JavaScript", "Supabase", "HTML5", "CSS3", "Vercel", "DOMPurify"],
    image: "/images/projects/autonoiq-website.png",
    screenshots: [
      "/images/projects/autonoiq-website-1.png",
      "/images/projects/autonoiq-website-2.png",
      "/images/projects/autonoiq-website-3.png",
      "/images/projects/autonoiq-website-4.png",
      "/images/projects/autonoiq-website-5.png",
    ],
    featured: false,
    order: 10,
  },
  {
    slug: "n8n-tuknang",
    title: "n8n Tuknang Auto-Poster",
    shortDescription:
      "Automated Facebook content system that generates and posts daily AI-created content for a property management app.",
    fullDescription: `Consistent social media content is critical for brand building, but creating daily posts manually is unsustainable for a small team. This n8n-powered pipeline fully automates Tuknang's Facebook content — from AI generation to scheduling to posting — producing 30 days of themed content without any human intervention.

### Key Features

- **30-Day Content Generation** — Batch-creates a full month of themed posts alternating between pain-point stories and feature highlights
- **Dual AI Models** — Uses Claude (via OpenRouter) for writing captions and GPT for generating matching images
- **Taglish Localization** — Content written in Taglish (Tagalog-English mix) to authentically connect with Filipino landlords
- **Scheduled Posting** — Cron-triggered daily posting at 8 AM PHT for consistent audience engagement
- **Email Alerts** — Automated notifications for successful posts and error conditions via Gmail integration

### Technical Highlights

Built entirely in **n8n** with no external application code. The batch generation workflow creates and stores 30 posts in a single run. A separate cron-triggered workflow picks the next scheduled post each morning and publishes it via the **Facebook Graph API**. JavaScript function nodes handle content formatting, date logic, and error handling. Gmail nodes send completion and error alerts to the team.

**Built with:** n8n, OpenRouter AI, Facebook API, Gmail, JavaScript`,
    category: "websites-automations",
    categoryLabel: "Websites & Automations",
    techStack: ["n8n", "OpenRouter AI", "Facebook API", "Gmail", "JavaScript"],
    image: "/images/projects/n8n-tuknang.png",
    screenshots: [
      "/images/projects/n8n-tuknang-1.png",
      "/images/projects/n8n-tuknang-2.png",
      "/images/projects/n8n-tuknang-3.png",
      "/images/projects/n8n-tuknang-4.png",
      "/images/projects/n8n-tuknang-5.png",
    ],
    featured: false,
    order: 11,
  },
  {
    slug: "smilevoice-dental",
    title: "SmileVoice",
    shortDescription:
      "AI voice assistant for a dental clinic that handles appointment booking, service inquiries, and patient intake over phone and web — fully conversational, zero hold time.",
    fullDescription: `Dental offices lose patients every day to unanswered calls and clunky online forms. SmileVoice is an AI-powered voice assistant built for Bright Smile Dental that answers every call, understands what the patient needs, checks real-time availability, and books the appointment — all in a natural, human-sounding conversation. It also lives as a widget on their website for patients who prefer to click instead of call.

### Key Features

- **Conversational Booking** — Patients describe what they need in plain language (cleaning, emergency, cosmetic consultation) and the assistant maps it to the right service, provider, and time slot
- **Phone + Web Widget** — Handles inbound calls via Twilio and embeds as a floating voice widget on the clinic website, delivering the same experience across both channels
- **Real-Time Availability** — Queries the clinic's scheduling system live during the conversation, offering only open slots and respecting provider-specific calendars
- **Smart Intake Collection** — Gathers new patient info (insurance, allergies, medical history flags) conversationally and syncs it to the practice management system before the visit
- **SMS Confirmations & Reminders** — Sends booking confirmations instantly via Twilio SMS, plus automated reminders 24 hours before the appointment
- **Bilingual Support** — Full conversational flow in English and Spanish, with automatic language detection from the first few seconds of speech

### Technical Highlights

The voice pipeline starts with **Twilio** receiving the inbound call and streaming audio to a WebSocket server. **Deepgram** handles real-time speech-to-text with medical vocabulary boosting for dental terminology. The transcript feeds into **OpenAI GPT-4** for intent extraction, entity recognition (service type, urgency, preferred date/time), and response generation. **ElevenLabs** converts the AI response back to natural-sounding speech and streams it to the caller with sub-second latency.

The clinic website is built on **Next.js** and **React** with **Tailwind CSS** and uses **Supabase** for the scheduling database, patient records, and auth. The voice widget is a custom React component that connects to the same AI pipeline via WebSocket, giving web visitors an identical conversational booking experience. An admin dashboard lets the front desk view upcoming AI-booked appointments, listen to call recordings, and override bookings when needed.

**Built with:** Next.js, React, Tailwind CSS, Supabase, OpenAI, ElevenLabs, Twilio, Deepgram`,
    category: "ai-bots",
    categoryLabel: "AI & Bots",
    techStack: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Supabase",
      "OpenAI",
      "ElevenLabs",
      "Twilio",
      "Deepgram",
    ],
    image: "/images/projects/smilevoice-dental.png",
    screenshots: [
      "/images/projects/smilevoice-dental-1.png",
      "/images/projects/smilevoice-dental-2.png",
      "/images/projects/smilevoice-dental-3.png",
      "/images/projects/smilevoice-dental-4.png",
      "/images/projects/smilevoice-dental-5.png",
    ],
    featured: true,
    order: 2,
  },
  {
    slug: "clinical-clarity",
    title: "Clinical Clarity",
    shortDescription:
      "Patient portal with a healthcare-inspired design system — therapeutic color palette, precision spacing, and accessibility-first UI for clinical workflows.",
    fullDescription: `Most patient portals feel like they were designed in 2005 and never updated — clunky interfaces, confusing navigation, and zero attention to the anxiety patients already feel when managing their health. Clinical Clarity is a modern patient portal built from the ground up with a meticulous healthcare-inspired design system that puts clarity, calm, and trust at the center of every interaction.

### Key Features

- **Appointment Management** — Book, reschedule, and cancel appointments with real-time provider availability and automated confirmation emails
- **Medical Records** — Secure access to lab results, visit summaries, imaging reports, and medication history in a clean, scannable layout
- **Secure Messaging** — HIPAA-aware message threads between patients and care teams with read receipts and file attachments
- **Prescription Refills** — One-click refill requests routed to the patient's pharmacy with status tracking from submission to pickup
- **Billing & Insurance** — Transparent view of charges, insurance claims, and payment history with online bill pay

### Technical Highlights

The design system follows a principle of **therapeutic restraint** — a warm white (#FAFBFC) base with teal (#0D9488, #14B8A6) as the primary accent, used structurally to mark interactive surfaces and pathways rather than decoratively. Spacing uses a consistent 8px grid for harmonic rhythm across every component. Rounded corners, whisper-thin elevation shadows, and deliberate negative space create interfaces that feel simultaneously trustworthy and inviting.

Built on **Next.js** and **React** with **Supabase** handling auth, database, and row-level security for patient data. **Tailwind CSS** powers the custom design token system with semantic color scales calibrated for accessibility contrast ratios. The component library is built for healthcare workflows — form inputs with inline validation, status badges with colorblind-safe palettes, and typography tuned for clinical readability.

**Built with:** Next.js, React, Supabase, Tailwind CSS`,
    category: "web-apps",
    categoryLabel: "Web Apps",
    techStack: ["Next.js", "React", "Supabase", "Tailwind CSS"],
    image: "/images/projects/clinical-clarity.png",
    screenshots: [
      "/images/projects/clinical-clarity-1.png",
      "/images/projects/clinical-clarity-2.png",
      "/images/projects/clinical-clarity-3.png",
      "/images/projects/clinical-clarity-4.png",
      "/images/projects/clinical-clarity-5.png",
    ],
    featured: true,
    order: 3,
  },
];

export function getAllProjects(): Project[] {
  return PROJECTS.sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((p) => p.featured).sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return PROJECTS.filter((p) => p.category === category).sort(
    (a, b) => a.order - b.order
  );
}

export const PROJECT_CATEGORIES = [
  { value: "all" as const, label: "All" },
  { value: "web-apps" as const, label: "Web Apps" },
  { value: "ai-bots" as const, label: "AI & Bots" },
  { value: "websites-automations" as const, label: "Websites & Automations" },
];
