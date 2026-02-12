import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { getProjectBySlug, PROJECTS } from "@/lib/projects";
import { TechBadge } from "@/components/shared/TechBadge";
import { ImageCarousel } from "@/components/projects/ImageCarousel";
import { ProjectDetailClient, MarkdownDescription } from "./ProjectDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="pt-24 pb-24 sm:pt-32 sm:pb-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>

        <ProjectDetailClient>
          {/* Hero Image / Carousel */}
          {project.screenshots && project.screenshots.length > 0 ? (
            <ImageCarousel images={project.screenshots} alt={project.title} />
          ) : (
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 relative">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          )}

          {/* Category Badge */}
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20 mb-4">
            {project.categoryLabel}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {project.title}
          </h1>

          {/* Description */}
          <MarkdownDescription content={project.fullDescription} />

          {/* Tech Stack */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <TechBadge key={tech} name={tech} />
              ))}
            </div>
          </div>

          {/* Links */}
          {(project.liveUrl || project.githubUrl) && (
            <div className="mt-8 flex gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full gradient-accent px-6 py-2.5 text-sm font-medium text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full glass px-6 py-2.5 text-sm font-medium text-text-primary"
                >
                  <Github className="h-4 w-4" />
                  View Source
                </a>
              )}
            </div>
          )}
        </ProjectDetailClient>
      </div>
    </div>
  );
}
