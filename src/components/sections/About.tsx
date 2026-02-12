"use client";

import { motion } from "motion/react";
import { TrendingUp, Clock, Layers, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionHeading } from "@/components/shared/SectionHeading";

const stats = [
  { value: "13+", label: "Years Experience", icon: Clock },
  { value: "9+", label: "Projects Built", icon: Layers },
  { value: "4", label: "Career Progressions", icon: TrendingUp },
  { value: "B.S.", label: "Degree in Finance", icon: GraduationCap },
];

const specializations = [
  "End-to-end workflow automation",
  "AI-powered bots & voice systems",
  "Full-stack web applications",
  "Process redesign & efficiency",
];

const timeline = [
  {
    year: "2023 - Present",
    title: "Vibe Coder & AI Builder",
    description:
      "Building end-to-end automation systems and modern web applications using Claude Code, n8n, Next.js, and AI tools. Turning manual bottlenecks into seamless, hands-off systems.",
  },
  {
    year: "2022 - 2023",
    title: "Automation Specialist",
    description:
      "Architected full client onboarding systems at Drivetechnolgy using GoHighLevel, n8n, and AI-powered workflows. Embedded automation at every stage of the marketing funnel.",
  },
  {
    year: "2019 - 2022",
    title: "Operations & Admin",
    description:
      "Executive assistant and operations manager at ConvrtX. Redesigned evaluation and reporting processes, driving 20% efficiency gains. This is where I started asking: how can this be automated?",
  },
  {
    year: "2011 - 2019",
    title: "BPO Leadership",
    description:
      "Progressed from call center agent to training manager across US telecom accounts. Built the operational discipline and process thinking that became the foundation for everything after.",
  },
];

export function About() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="About Me"
          subtitle="From BPO leadership to building AI-powered automation systems"
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column */}
          <div className="space-y-6">
            {/* Bio */}
            <ScrollReveal>
              <GlassCard padding="lg">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Who I Am</h3>
                <p className="text-text-secondary leading-relaxed">
                  Results-driven Automations Expert and Vibe Coder with over 13 years of
                  professional experience spanning operations, marketing, and workflow automation.
                  Self-taught in platforms like n8n, Claude Code, and GoHighLevel, with a proven
                  ability to rapidly learn any tool and turn manual, repetitive processes into
                  streamlined automated systems.
                </p>
                <p className="mt-4 text-text-secondary leading-relaxed">
                  Known for identifying inefficiencies early and building end-to-end solutions
                  that boost productivity and reduce operational overhead.
                </p>
              </GlassCard>
            </ScrollReveal>

            {/* Stats Grid */}
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <GlassCard key={stat.label} variant="subtle" padding="sm">
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className="h-4 w-4 text-accent-primary" />
                      <span className="text-xl font-bold text-text-primary">{stat.value}</span>
                    </div>
                    <span className="text-xs text-text-muted">{stat.label}</span>
                  </GlassCard>
                ))}
              </div>
            </ScrollReveal>

            {/* Specializations */}
            <ScrollReveal delay={0.3}>
              <GlassCard variant="subtle" padding="lg">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                  What I Specialize In
                </h4>
                <ul className="space-y-2">
                  {specializations.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="h-1.5 w-1.5 rounded-full gradient-accent flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </ScrollReveal>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent-primary/50 via-accent-secondary/50 to-transparent" />

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <ScrollReveal key={item.year} delay={i * 0.15}>
                  <div className="relative pl-12">
                    {/* Timeline Dot */}
                    <motion.div
                      className="absolute left-2.5 top-2 h-3 w-3 rounded-full gradient-accent"
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.15 }}
                    />

                    <GlassCard padding="sm" variant="subtle">
                      <span className="text-xs font-medium text-text-muted">
                        {item.year}
                      </span>
                      <h3 className="mt-1 text-base font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </GlassCard>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
