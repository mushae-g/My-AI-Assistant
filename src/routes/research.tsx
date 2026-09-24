import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Telescope, Wand2, Sparkles, Compass, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { OutputActions } from "@/components/OutputActions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { researchTopic, sleep, type ResearchResult } from "@/lib/ai-sim";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — My AI Assistant" },
      {
        name: "description",
        content: "Enter a topic or paste an article to get a structured overview, key insights and practical recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — My AI Assistant" },
      { property: "og:description", content: "Structure any topic into insights, recommendations and open questions." },
    ],
  }),
  component: ResearchPage,
});

function toPlainText(r: ResearchResult) {
  return [
    "OVERVIEW",
    r.overview,
    "",
    "KEY INSIGHTS",
    ...r.insights.map((i) => `- ${i}`),
    "",
    "RECOMMENDATIONS",
    ...r.recommendations.map((i) => `- ${i}`),
    "",
    "OPEN QUESTIONS",
    ...r.questions.map((i) => `- ${i}`),
  ].join("\n");
}

function ResearchPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const variant = useRef(0);

  async function run(regenerate = false) {
    if (input.trim().length < 4) {
      setError("Enter a topic or paste some article text to research.");
      toast.error("Nothing to research yet");
      return;
    }
    setError("");
    setBusy(true);
    if (regenerate) variant.current += 1;
    try {
      await sleep(900 + Math.random() * 700);
      setResult(researchTopic(input, variant.current));
      logActivity("research", `Researched "${input.trim().slice(0, 48)}"`);
      toast.success(regenerate ? "New angle generated" : "Research ready");
    } catch {
      setError("Couldn't build the research brief. Try again.");
      toast.error("Research failed");
    } finally {
      setBusy(false);
    }
  }

  const blocks = result
    ? ([
        { key: "insights", title: "Key insights", icon: Sparkles, items: result.insights },
        { key: "recommendations", title: "Practical recommendations", icon: Compass, items: result.recommendations },
        { key: "questions", title: "Open questions", icon: HelpCircle, items: result.questions },
      ] as const)
    : [];

  function updateList(key: "insights" | "recommendations" | "questions", index: number, value: string) {
    setResult((prev) => (prev ? { ...prev, [key]: prev[key].map((v, i) => (i === index ? value : v)) } : prev));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tool 03"
        title="AI Research Assistant"
        description="Give it a topic or paste an article. Get a structured overview, sharp insights and moves you can actually make."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="card-elegant space-y-4 p-5">
          <div>
            <Label htmlFor="topic">Topic or article text</Label>
            <Textarea
              id="topic"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. hybrid work policy for a 40-person design studio — or paste an entire article here."
              className="mt-1.5 min-h-56 resize-y"
            />
          </div>

          {error ? (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="size-4" /> {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void run(false)} disabled={busy}>
              <Wand2 /> {busy ? "Researching…" : "Research this"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setInput("");
                setResult(null);
                setError("");
              }}
            >
              Clear
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          {busy && !result ? (
            <div className="card-elegant space-y-3 p-5">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${50 + ((i * 19) % 48)}%` }} />
              ))}
            </div>
          ) : result ? (
            <>
              <div className="card-elegant p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold">Overview</h2>
                  <OutputActions
                    text={toPlainText(result)}
                    busy={busy}
                    onRegenerate={() => void run(true)}
                    onClear={() => setResult(null)}
                    label="Research brief"
                  />
                </div>
                <Textarea
                  value={result.overview}
                  onChange={(e) => setResult({ ...result, overview: e.target.value })}
                  className="min-h-32 resize-y text-sm leading-relaxed"
                  aria-label="Overview, editable"
                />
              </div>

              {blocks.map(({ key, title, icon: Icon, items }) => (
                <div key={key} className="card-elegant p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4 text-primary" /> {title}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-petal" />
                        <Textarea
                          value={item}
                          onChange={(e) => updateList(key, i, e.target.value)}
                          className="min-h-0 resize-none border-transparent bg-transparent px-1 py-0.5 text-sm leading-relaxed shadow-none focus-visible:border-input field-sizing-content"
                          rows={1}
                          aria-label={`${title} item ${i + 1}`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            <div className="card-elegant grid min-h-72 place-items-center p-10 text-center">
              <div>
                <Telescope className="mx-auto mb-3 size-8 text-primary/60" />
                <p className="text-sm text-muted-foreground">
                  Your structured brief — overview, insights, recommendations — lands here.
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
