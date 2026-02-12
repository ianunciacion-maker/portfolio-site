"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowDown, Sparkles } from "lucide-react";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ParticleField } from "@/components/shared/ParticleField";
import { Button } from "@/components/shared/Button";

const floatingShapes = [
  { size: 80, x: "5%", y: "15%", delay: 0, duration: 6 },
  { size: 60, x: "90%", y: "10%", delay: 1, duration: 7 },
  { size: 50, x: "92%", y: "70%", delay: 2, duration: 5 },
  { size: 70, x: "8%", y: "75%", delay: 0.5, duration: 8 },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]">
      {/* Particle Background */}
      <ParticleField />

      {/* Floating Glass Shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl backdrop-blur-[8px] border border-white/10 bg-white/5 dark:bg-white/[0.03]"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-[120px] dark:bg-white/[0.03]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-[100px] dark:bg-white/[0.03]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 w-full">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text Content — Left */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-text-secondary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Automations Expert & Vibe Coder
            </motion.div>

            {/* Name */}
            <AnimatedText
              text="Ian Anunciacion"
              as="h1"
              className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
              delay={0.2}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-4 max-w-lg text-lg text-text-secondary"
            >
              13+ years of transforming manual processes into automated systems.
              I build web apps, AI bots, and automation workflows that help businesses scale.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Button href="#projects" size="lg">
                View My Work
              </Button>
              <Button href="#contact" variant="outline" size="lg">
                Get In Touch
              </Button>
            </motion.div>
          </div>

          {/* Image — Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Animated glow ring behind image */}
              <motion.div
                className="absolute -inset-3 rounded-3xl"
                animate={{
                  background: [
                    "linear-gradient(0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                    "linear-gradient(120deg, rgba(255,255,255,0.02), rgba(255,255,255,0.08))",
                    "linear-gradient(240deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                    "linear-gradient(360deg, rgba(255,255,255,0.02), rgba(255,255,255,0.08))",
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ filter: "blur(30px)" }}
              />

              {/* Orbiting dot — top */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-white/30 dark:bg-white/20"
                animate={{
                  x: [0, 80, 160, 80, 0],
                  y: [-20, -10, -20, -30, -20],
                  opacity: [0.3, 0.7, 0.3, 0.7, 0.3],
                  scale: [1, 1.3, 1, 1.3, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{ left: "20%", top: 0 }}
              />

              {/* Orbiting dot — bottom */}
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full bg-white/25 dark:bg-white/15"
                animate={{
                  x: [0, -60, -120, -60, 0],
                  y: [10, 0, 10, 20, 10],
                  opacity: [0.2, 0.6, 0.2, 0.6, 0.2],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                style={{ right: "15%", bottom: "10%" }}
              />

              {/* Glass frame */}
              <div className="relative rounded-2xl overflow-hidden glass p-1.5">
                {/* Floating + subtle breathe animation */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.01, 1],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <Image
                    src="/images/ian-hero.png"
                    alt="Ian Anunciacion"
                    width={400}
                    height={500}
                    priority
                    className="rounded-xl object-cover w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] lg:w-[380px] lg:h-[475px] grayscale-[30%] contrast-[1.05] brightness-[1.02] dark:brightness-[0.9] dark:grayscale-[40%]"
                  />

                  {/* Animated shine sweep across image */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      background: [
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
                        "linear-gradient(105deg, transparent 60%, rgba(255,255,255,0.06) 65%, rgba(255,255,255,0.12) 70%, rgba(255,255,255,0.06) 75%, transparent 80%)",
                      ],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              {/* Decorative glass shard — bottom left */}
              <motion.div
                className="absolute -bottom-3 -left-3 w-12 h-12 rounded-xl backdrop-blur-md border border-white/10 bg-white/5 dark:bg-white/[0.03]"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 10, 0],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              {/* Decorative glass shard — top right */}
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 rounded-lg backdrop-blur-md border border-white/10 bg-white/5 dark:bg-white/[0.03]"
                animate={{
                  y: [0, 6, 0],
                  rotate: [0, -15, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="mx-auto h-5 w-5 text-text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
