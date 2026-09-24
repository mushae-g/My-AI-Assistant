import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Wand2, AlertTriangle, Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { OutputActions } from "@/components/OutputActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { generateEmail, sleep, type Tone } from "@/lib/ai-sim";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — My AI Assistant" },
      {
        name: "description",
        content: "Describe what you need to say and get a polished email in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator — My AI Assistant" },
      { property: "og:description", content: "Turn a one-line instruction into a ready-to-send email draft." },
    ],
  }),
  component: EmailPage,
});

const TONES: { id: Tone; label: string; hint: string }[] = [
  { id: "formal", label: "Formal", hint: "Measured and professional" },
  { id: "friendly", label: "Friendly", hint: "Warm and conversational" },
  { id: "persuasive", label: "Persuasive", hint: "Direct with a clear ask" },
];

function EmailPage() {
  const [instruction, setInstruction] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState<Tone>("friendly");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const variant = useRef(0);

  async function run(regenerate = false) {
    if (instruction.trim().length < 12) {
      setError("Tell me a bit more — at least a sentence about what the email should say.");
      toast.error("Add a little more detail first");
      return;
    }
    setError("");
    setBusy(true);
    if (regenerate) variant.current += 1;
    try {
      await sleep(700 + Math.random() * 600);
      const text = generateEmail({ instruction, tone, recipient, sender }, variant.current);
      setOutput(text);
      logActivity("email", `${TONES.find((t) => t.id === tone)!.label} email${recipient ? ` to ${recipient}` : ""}`);
      toast.success(regenerate ? "New version ready" : "Email drafted");
    } catch {
      setError("Something went wrong while drafting. Try again.");
      toast.error("Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tool 01"
        title="Smart Email Generator"
        description="Say what you need in plain language. Pick a tone. Edit the result until it sounds like you."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="card-elegant space-y-4 p-5">
          <div>
            <Label htmlFor="instruction">What should the email say?</Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Ask the design team for the final logo files, explain the print deadline is Friday, and offer to help if they're stretched."
              className="mt-1.5 min-h-40 resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Priya"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="sender">Your name</Label>
              <Input
                id="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Sam"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Tone</Label>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    tone === t.id
                      ? "border-primary bg-primary-soft text-accent-foreground"
                      : "border-border hover:bg-muted/60"
                  }`}
                >
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="size-4" /> {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void run(false)} disabled={busy}>
              <Wand2 /> {busy ? "Drafting…" : "Generate email"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setInstruction("");
                setRecipient("");
                setSender("");
                setOutput("");
                setError("");
              }}
            >
              Clear inputs
            </Button>
          </div>
        </section>

        <section className="card-elegant flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Draft</h2>
            {output ? (
              <OutputActions text={output} busy={busy} onRegenerate={() => void run(true)} onClear={() => setOutput("")} label="Email" />
            ) : null}
          </div>

          {busy && !output ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${60 + ((i * 13) % 38)}%` }} />
              ))}
            </div>
          ) : output ? (
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-[26rem] resize-y font-mono text-[13px] leading-relaxed"
              aria-label="Generated email, editable"
            />
          ) : (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border p-10 text-center">
              <div>
                <Mail className="mx-auto mb-3 size-8 text-primary/60" />
                <p className="text-sm text-muted-foreground">
                  Your draft appears here — fully editable, with copy and regenerate.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <Disclaimer className="mt-6" />
    </div>
  );
}
