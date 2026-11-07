import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { contactQuery } from "@/lib/queries";
import { NAV, SCHOOL } from "@/lib/school";

export function Footer() {
  const { data: c } = useQuery(contactQuery);
  return (
    <footer className="bg-ink-gradient text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="" width={44} height={40} className="h-11 w-auto rounded bg-ink-foreground p-1" />
            <div>
              <div className="font-display text-xl">Calvary</div>
              <div className="text-xs uppercase tracking-[0.2em] opacity-70">Group of Schools</div>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-75">Founded in 2005. Motto: “{SCHOOL.motto}”. Government approved for WAEC, NECO & BECE.</p>
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-gold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-gold">Campuses</h3>
          <ul className="mt-4 space-y-4 text-sm opacity-85">
            <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> <span><b>Main:</b> {c?.mainAddress}</span></li>
            <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> <span><b>Annex:</b> {c?.annexAddress}</span></li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-gold">Reach us</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            {c?.phones.map((p) => (
              <li key={p} className="flex gap-2"><Phone className="size-4" /><a href={`tel:${p.replace(/\s/g, "")}`}>{p}</a></li>
            ))}
            {c?.emails.map((e) => (
              <li key={e} className="flex gap-2"><Mail className="size-4" /><a href={`mailto:${e}`} className="break-all">{e}</a></li>
            ))}
          </ul>
          <div className="mt-4 flex gap-4 text-sm">
            {c?.facebook && <a href={c.facebook} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Facebook</a>}
            {c?.x && <a href={c.x} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">X (Twitter)</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-5 text-xs opacity-70 sm:flex-row">
          <span>© {new Date().getFullYear()} Calvary Group of Schools, Arepo. All rights reserved.</span>
          <Link to="/admin" className="hover:opacity-100">Staff sign in</Link>
        </div>
      </div>
    </footer>
  );
}
