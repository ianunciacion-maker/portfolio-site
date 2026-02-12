import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="h-16 sm:h-24 bg-gradient-to-b from-bg-primary to-bg-secondary/30 dark:from-[#0a0a0a] dark:to-bg-secondary/30" />
      <About />
      <FeaturedProjects />
      <Skills />
      <Contact />
    </>
  );
}
