import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { formatDate } from '@/lib/content';
import type { PostRow } from '@/lib/queries';
export function NewsItems({ posts }: { posts: PostRow[] }) {
  return <div className="grid gap-8 md:grid-cols-3">{posts.map(p => <article key={p.id} className="min-w-0 border-b pb-6"><Link to="/news/$id" params={{ id: p.id }} className="group block">{p.image_url && <img src={p.image_url} alt="" loading="lazy" className="mb-5 aspect-[3/2] w-full rounded-lg object-cover"/>}<p className="text-xs font-semibold uppercase text-accent">{p.category} · {formatDate(p.published_at)}</p><h3 className="mt-3 flex items-start justify-between gap-3 text-2xl text-primary">{p.title}<ArrowUpRight className="size-5 shrink-0 transition group-hover:translate-x-1"/></h3><p className="mt-3 text-muted-foreground">{p.excerpt}</p></Link></article>)}</div>;
}
