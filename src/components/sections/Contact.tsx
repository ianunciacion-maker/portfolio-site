"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/shared/Button";
import { AnimatedCheckmark } from "@/components/shared/AnimatedCheckmark";
import { SuccessConfetti } from "@/components/shared/SuccessConfetti";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const easing = [0.25, 0.46, 0.45, 0.94] as const;

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(
        "https://formsubmit.co/ajax/ianjoseph.anunciacion@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      const result = await res.json();
      if (res.ok && result.success === "true") {
        setSubmitted(true);
        reset();
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } catch {
      clearTimeout(timeout);
      setSubmitError("Network error. Please check your connection and try again.");
    }
  };

  const inputClasses = cn(
    "w-full rounded-xl px-4 py-3 text-sm",
    "bg-white/10 dark:bg-white/5",
    "border border-[var(--glass-border)]",
    "backdrop-blur-sm",
    "text-text-primary placeholder:text-text-muted",
    "focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50",
    "transition-colors"
  );

  return (
    <section id="contact" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Let's Work Together"
          subtitle="Have a project in mind or want to discuss automation opportunities? Get in touch."
        />

        <ScrollReveal>
          <GlassCard padding="lg" className="max-w-4xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Info */}
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Get In Touch
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-8">
                  Whether you need workflow automation, a custom web application, expertly
                  crafted AI prompts, or an AI-powered bot — I can help you streamline
                  your operations and scale your business.
                </p>

              </div>

              {/* Form / Success */}
              <div>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      ref={successRef}
                      className="flex flex-col items-center justify-center h-full text-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: easing }}
                    >
                      <AnimatedCheckmark className="h-12 w-12 text-green-500 mb-4" />
                      <motion.h4
                        className="text-lg font-semibold text-text-primary"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: easing, delay: 0.6 }}
                      >
                        Message Sent!
                      </motion.h4>
                      <motion.p
                        className="mt-2 text-sm text-text-secondary"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: easing, delay: 0.8 }}
                      >
                        Thanks for reaching out. I&apos;ll get back to you soon.
                      </motion.p>
                      <SuccessConfetti trigger={submitted} originRef={successRef} />
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: easing }}
                    >
                      <div>
                        <input
                          {...register("name", { required: "Name is required" })}
                          placeholder="Your Name"
                          className={inputClasses}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Please enter a valid email",
                            },
                          })}
                          type="email"
                          placeholder="Your Email"
                          className={inputClasses}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <textarea
                          {...register("message", {
                            required: "Message is required",
                            minLength: {
                              value: 10,
                              message: "Message must be at least 10 characters",
                            },
                          })}
                          placeholder="Tell me about your project..."
                          rows={5}
                          className={cn(inputClasses, "resize-none")}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-400">
                            {errors.message.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            Send Message
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                      {submitError && (
                        <p className="mt-2 text-xs text-red-400 text-center">
                          {submitError}
                        </p>
                      )}
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
