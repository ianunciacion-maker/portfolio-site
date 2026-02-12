"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getAllProjects, PROJECT_CATEGORIES } from "@/lib/projects";
import { cn } from "@/lib/utils";
import type { ProjectCategory } from "@/types";

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | ProjectCategory>("all");
  const allProjects = getAllProjects();

  const filtered =
    activeFilter === "all"
      ? allProjects
      : allProjects.filter((p) => p.category === activeFilter);

  return (
    <div className="pt-24 pb-24 sm:pt-32 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="All Projects"
          subtitle="Web apps, AI bots, automation workflows, and everything in between"
        />

        {/* Filter Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value as "all" | ProjectCategory)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeFilter === cat.value
                  ? "gradient-accent text-white shadow-lg shadow-accent-primary/25"
                  : "glass text-text-secondary hover:text-text-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={project} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
