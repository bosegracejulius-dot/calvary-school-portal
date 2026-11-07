import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/school";
import { useQuery } from "@tanstack/react-query";
import { contactQuery } from "@/lib/queries";

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: contact } = useQuery(contactQuery);
  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-ink-gradient text-ink-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <span className="opacity-80">Pre-school · Primary · Junior & Senior Secondary — Arepo, Ogun State</span>
          <div className="flex gap-5 opacity-90">
            <a href={`mailto:${contact?.emails[0]}`} className="hover:opacity-100">{contact?.emails[0]}</a>
            <a href={`tel:${contact?.phones[0]?.replace(/\s/g, "")}`}>{contact?.phones[0]}</a>
          </div>
        </div>
      </div>
      <div className="border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src="/images/logo.png" alt="Calvary Group of Schools crest" width={44} height={40} className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold text-primary">Calvary</div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Group of Schools</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.slice(1).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-primary"
                activeProps={{ className: "text-primary bg-muted" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Search the website">
              <Link to="/search" search={{ q: "" }}><Search className="size-5" /></Link>
            </Button>
            <Button asChild variant="accent" className="hidden sm:inline-flex">
              <Link to="/admissions">Apply now</Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="animate-in slide-in-from-top-2 border-t bg-background px-4 pb-5 pt-2 lg:hidden" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-base font-medium hover:bg-muted"
                activeProps={{ className: "text-accent" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Button asChild variant="accent" className="mt-3 w-full" size="lg">
              <Link to="/admissions" onClick={() => setOpen(false)}>Apply for admission</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
