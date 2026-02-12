"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, Send, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    const res = await fetch("https://formspree.io/f/xpwzgkba", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmitted(true);
      reset();
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
                  Whether you need workflow automation, a custom web application, or an
                  AI-powered bot — I can help you streamline your operations and scale
                  your business.
                </p>

                <div className="space-y-4">
                  <a
                    href="mailto:ianjoseph.anunciacion@gmail.com"
                    className="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full glass">
                      <Mail className="h-4 w-4" />
                    </div>
                    ianjoseph.anunciacion@gmail.com
                  </a>
                  <a
                    href="tel:+639184692844"
                    className="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full glass">
                      <Phone className="h-4 w-4" />
                    </div>
                    +63 918 469 2844
                  </a>
                </div>
              </div>

              {/* Form */}
              <div>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h4 className="text-lg font-semibold text-text-primary">
                      Message Sent!
                    </h4>
                    <p className="mt-2 text-sm text-text-secondary">
                      Thanks for reaching out. I&apos;ll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  </form>
                )}
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
