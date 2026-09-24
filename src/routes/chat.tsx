import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Leaf, Eraser, Copy, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { copyText } from "@/components/OutputActions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatReply, sleep } from "@/lib/ai-sim";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — My AI Assistant" },
      {
        name: "description",
        content: "Chat with My AI Assistant about work problems and get structured, practical replies in seconds.",
      },
      { property: "og:title", content: "AI Chat — My AI Assistant" },
      { property: "og:description", content: "A workplace chat assistant that keeps context for the current session." },
    ],
  }),
  component: ChatPage,
});

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm My AI Assistant. Ask me about a work problem, a plan you're shaping, or something you need to write — I'll reply with a structured take you can act on.",
};

const SUGGESTIONS = [
  "How do I run a productive weekly team check-in?",
  "Help me prioritise three competing deadlines",
  "What should go in a project kickoff brief?",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: prompt };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);
    try {
      await sleep(600 + Math.random() * 700);
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: chatReply(prompt, history) }]);
      logActivity("chat", `Chat: ${prompt.slice(0, 44)}`);
    } catch {
      toast.error("The assistant couldn't respond. Try sending it again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tool 04"
        title="AI Chat"
        description="A workplace assistant for thinking out loud. History stays in this session only."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMessages([GREETING]);
              toast.success("Conversation cleared");
            }}
          >
            <Eraser /> New conversation
          </Button>
        }
      />

      <div className="card-elegant flex h-[min(70vh,44rem)] flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((m) =>
            m.role === "assistant" ? (
              <div key={m.id} className="group flex gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{m.content}</p>
                  <button
                    type="button"
                    onClick={() => void copyText(m.content, "Reply")}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                  >
                    <Copy className="size-3" /> Copy
                  </button>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end gap-3">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground shadow-soft">
                  {m.content}
                </p>
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <User className="size-4" />
                </span>
              </div>
            ),
          )}

          {busy ? (
            <div className="flex gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-4" />
              </span>
              <span className="animate-pulse text-sm text-muted-foreground">Thinking…</span>
            </div>
          ) : null}

          {messages.length === 1 && !busy ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs transition-colors hover:bg-primary-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-border bg-muted/30 p-3"
        >
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask My AI Assistant anything about your work…"
              className="max-h-40 min-h-11 resize-none bg-card"
              rows={1}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send message">
              <Send />
            </Button>
          </div>
        </form>
      </div>

      <Disclaimer className="mt-6" />
    </div>
  );
}
