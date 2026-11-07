import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import mark from "@/assets/calvary-ai-mark.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { SUGGESTED_QUESTIONS } from "@/lib/school";

function ChatPanel({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  const [text, setText] = useState("");
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error(e.message || "Calvary AI couldn't reply. Please try again."),
  });
  const busy = status === "submitted" || status === "streaming";

  const ask = (q: string) => {
    if (!q.trim() || busy) return;
    sendMessage({ text: q.trim() });
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 bg-ink-gradient px-4 py-3 text-ink-foreground">
        <img src={mark} alt="" width={40} height={40} className="size-10 rounded-full bg-ink-foreground/95 p-0.5" />
        <div className="flex-1">
          <div className="font-display text-lg leading-tight">Calvary AI</div>
          <div className="text-xs opacity-75">AI school assistant · answers from verified school information</div>
        </div>
        <Button variant="heroOutline" size="icon-sm" onClick={onReset} aria-label="Start a new chat" title="New chat">
          <MessageSquarePlus />
        </Button>
        <Button variant="heroOutline" size="icon-sm" onClick={onClose} aria-label="Close Calvary AI">
          <X />
        </Button>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="gap-5 p-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted p-4 text-sm">
                <p className="font-semibold text-primary">Hello! I’m Calvary AI 👋</p>
                <p className="mt-1 text-muted-foreground">
                  I can answer questions about Calvary Group of Schools — our history, levels, admissions, facilities, pledge, events and how to reach us. I’m an AI assistant, so for official decisions please contact the school.
                </p>
              </div>
              <p className="eyebrow">Try asking</p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => ask(q)} className="rounded-xl border bg-card px-3 py-2 text-left text-sm transition hover:border-accent hover:text-accent">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message from={m.role} key={m.id}>
              <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <span key={i}>{p.text}</span>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer className="text-sm">Searching school information…</Shimmer>}
          {error && !busy && <p className="text-sm text-destructive">Something went wrong. Please try asking again.</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-background p-3">
        {messages.length > 0 && !busy && (
          <Suggestions className="mb-2">
            {SUGGESTED_QUESTIONS.slice(1, 5).map((q) => (
              <Suggestion key={q} suggestion={q} onClick={ask} />
            ))}
          </Suggestions>
        )}
        <PromptInput onSubmit={(msg) => ask(msg.text)}>
          <PromptInputTextarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about admissions, history, facilities…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-[0.68rem] text-muted-foreground">Calvary AI can make mistakes. Confirm important details with the school.</p>
      </div>
    </div>
  );
}

export function CalvaryAI() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Calvary AI chat"
          className="animate-in fade-in slide-in-from-bottom-4 fixed inset-0 z-50 overflow-hidden bg-background sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[640px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px] sm:rounded-3xl sm:border sm:shadow-lift"
        >
          <ChatPanel key={session} onClose={() => setOpen(false)} onReset={() => setSession((s) => s + 1)} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria label="Open Calvary AI assistant"
        aria-label={open ? "Close Calvary AI" : "Ask Calvary AI"}
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-ink-gradient py-2 pl-2 pr-5 text-ink-foreground shadow-lift transition hover:scale-105 sm:bottom-6 sm:right-6 ${open ? "max-sm:hidden" : "animate-pulse-ring"}`}
      >
        <img src={mark} alt="" width={40} height={40} className="size-10 rounded-full bg-ink-foreground p-0.5" />
        <span className="text-sm font-semibold">{open ? "Close" : "Ask Calvary AI"}</span>
      </button>
    </>
  );
}
