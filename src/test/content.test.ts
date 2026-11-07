import { describe, expect, it } from "vitest";
import { chunkText, splitEvents } from "@/lib/content";

describe("events", () => {
  const now = new Date("2026-11-07T12:00:00Z");
  const events = [
    { id: "a", starts_at: "2026-03-06T09:00:00Z" },
    { id: "b", starts_at: "2026-12-01T09:00:00Z" },
  ];
  it("never lists a past event as upcoming", () => {
    const { upcoming, past } = splitEvents(events, now);
    expect(upcoming.map((e) => e.id)).toEqual(["b"]);
    expect(past.map((e) => e.id)).toEqual(["a"]);
  });
});

describe("knowledge chunks", () => {
  it("keeps every chunk within the size limit", () => {
    const text = Array.from({ length: 20 }, (_, i) => `Paragraph ${i} `.repeat(30)).join("\n\n");
    const chunks = chunkText(text, 500);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 500)).toBe(true);
  });
});
