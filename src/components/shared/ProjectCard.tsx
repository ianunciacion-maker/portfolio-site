"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { TechBadge } from "./TechBadge";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      layout
    >
      <Link href={`/projects/${project.slug}`}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <GlassCard padding="none" className="overflow-hidden group cursor-pointer h-full">
            {/* Project Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-text-secondary transition-colors">
                  {project.title}
                </h3>
                <span className="text-xs text-text-muted">{project.categoryLabel}</span>
              </div>
              <p className="mb-4 text-sm text-text-secondary line-clamp-2">
                {project.shortDescription}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 4).map((tech) => (
                  <TechBadge key={tech} name={tech} />
                ))}
                {project.techStack.length > 4 && (
                  <span className="text-xs text-text-muted self-center">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Link>
    </motion.div>
  );
}
