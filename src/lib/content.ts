// Pure helpers shared by pages, admin and tests.

export type EventRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  starts_at: string;
  time_label: string;
  published: boolean;
};

/** Only events whose date is today or later count as upcoming; everything else is past. */
export function splitEvents<T extends { starts_at: string }>(events: T[], now: Date = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter((e) => new Date(e.starts_at) >= startOfToday)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
  const past = events
    .filter((e) => new Date(e.starts_at) < startOfToday)
    .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at));
  return { upcoming, past };
}

/** Split a document into paragraph-based chunks of at most `max` characters for retrieval. */
export function chunkText(text: string, max = 900): string[] {
  const paras = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paras) {
    if (p.length > max) {
      if (current) chunks.push(current), (current = "");
      for (let i = 0; i < p.length; i += max) chunks.push(p.slice(i, i + max));
      continue;
    }
    if ((current + "\n\n" + p).length > max && current) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
