import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: string; intro?: string; image: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div className="mx-auto max-w-7xl px-6 py-20 text-primary-foreground md:py-28">
        <p className="eyebrow animate-rise text-gold">{eyebrow}</p>
        <h1 className="animate-rise mt-3 max-w-3xl text-4xl font-semibold md:text-6xl">{title}</h1>
        {intro && <p className="animate-rise mt-5 max-w-2xl text-lg opacity-85">{intro}</p>}
      </div>
    </section>
  );
}

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-6 py-16 md:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, center }: { eyebrow: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-primary md:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}

/** Clearly labelled placeholder for information the school has not yet confirmed. */
export function ToConfirm({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-2xl border border-dashed border-notice-foreground/30 bg-notice p-4 text-sm text-notice-foreground", className)}>
      <Info className="mt-0.5 size-4 shrink-0" />
      <div><b>To be confirmed by the school:</b> {children}</div>
    </div>
  );
}
