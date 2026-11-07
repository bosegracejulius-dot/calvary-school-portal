// Server-only: Calvary AI retrieval-augmented chat. Never import from client code.
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

function publicDb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function textOf(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ");
}

async function retrieve(question: string) {
  const db = publicDb();
  const [kb, events, posts] = await Promise.all([
    db.rpc("search_kb", { q: question, match_count: 8 }),
    db.from("events").select("title,starts_at,venue,time_label,description").eq("published", true).gte("starts_at", new Date().toISOString()).order("starts_at").limit(10),
    db.from("posts").select("title,excerpt,published_at,category").eq("published", true).order("published_at", { ascending: false }).limit(5),
  ]);
  const sources = (kb.data ?? []).map((c, i) => `[S${i + 1}] (${c.title} — ${c.source})\n${c.content}`).join("\n\n");
  const ev = (events.data ?? []).map((e) => `- ${e.title}: ${new Date(e.starts_at).toDateString()} ${e.time_label} at ${e.venue}. ${e.description}`).join("\n");
  const news = (posts.data ?? []).map((p) => `- ${p.title} (${p.category}, ${new Date(p.published_at).toDateString()}): ${p.excerpt}`).join("\n");
  return { sources, ev, news };
}

function instructions(ctx: Awaited<ReturnType<typeof retrieve>>) {
  return `You are Calvary AI, the official digital assistant on the website of Calvary Group of Schools, Arepo, Ogun State, Nigeria. You are an AI assistant, not a human teacher or administrator — never pretend otherwise.

Today's date: ${new Date().toDateString()}.

RULES
- Answer ONLY from the SCHOOL KNOWLEDGE, UPCOMING EVENTS and RECENT NEWS below. Never invent rules, fees, dates, policies, staff names or historical facts.
- If the information is not there, say plainly that you don't have that information yet and suggest contacting the school (info@calvarygroupofschools.com, Principal Office 0703 892 9888) or using the Contact page.
- For anything needing an official decision (admission offers, fee waivers, discipline cases, complaints), direct the user to school management.
- Never reveal or speculate about private information on any student, parent or staff member.
- Mention the source for important facts, e.g. "(Source: Official website — Admission page)". Use the source names shown in brackets.
- Events from past dates are past, not upcoming.
- Be warm, clear and concise. Use short paragraphs or bullet lists. Use Nigerian English conventions.

SCHOOL KNOWLEDGE
${ctx.sources || "(no matching documents found)"}

UPCOMING EVENTS
${ctx.ev || "(none currently published)"}

RECENT NEWS
${ctx.news || "(none)"}`;
}

export async function handleChat(request: Request) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return Response.json({ error: "Calvary AI is not configured yet." }, { status: 500 });

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return Response.json({ error: "No question received." }, { status: 400 });
  const question = textOf(lastUser).slice(0, 2000);
  // Include the previous user turn so follow-ups ("what about fees?") still retrieve context.
  const prevUser = messages.filter((m) => m.role === "user").slice(-2, -1).map(textOf).join(" ");

  const ctx = await retrieve(`${question} ${prevUser}`.trim());

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: instructions(ctx),
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onError: (err) => {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 429) return "Calvary AI is busy right now. Please try again in a moment.";
        if (status === 402) return "Calvary AI has reached its usage limit. Please contact the school directly for now.";
        return "Sorry, Calvary AI couldn't answer just now. Please try again.";
      },
    }),
    runIdFetch,
  );
}
