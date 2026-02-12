import { SOCIAL_LINKS } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {};

export function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-bg-secondary/50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Ian Anunciacion. Built with Next.js & Motion.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label={link.label}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
