import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/projects";
import { SITE_CONFIG } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectUrls = PROJECTS.map((p) => ({
    url: `${SITE_CONFIG.url}/projects/${p.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: SITE_CONFIG.url, lastModified: new Date() },
    { url: `${SITE_CONFIG.url}/projects`, lastModified: new Date() },
    ...projectUrls,
  ];
}
