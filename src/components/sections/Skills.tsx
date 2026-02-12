"use client";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SKILL_CATEGORIES } from "@/lib/skills";

export function Skills() {
  return (
    <section id="skills" className="py-16 sm:py-20 bg-bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Tools & Technologies"
          subtitle="The stack I use to build automations, web apps, and AI-powered systems"
        />

        <div className="space-y-8">
          {SKILL_CATEGORIES.map((category, catIndex) => (
            <ScrollReveal key={category.name} delay={catIndex * 0.1}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {category.skills.map((skill) => (
                  <SkillBadge key={skill.name} name={skill.name} />
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
