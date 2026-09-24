import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ListChecks, Gavel, CalendarClock, Lightbulb, Wand2, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { copyText, OutputActions } from "@/components/OutputActions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeMeeting, sleep, type MeetingResult } from "@/lib/ai-sim";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — My AI Assistant" },
      {
        name: "description",
        content: "Paste messy meeting notes and get a concise summary with action items, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — My AI Assistant" },
      { property: "og:description", content: "Turn raw meeting notes into actions, decisions, deadlines and key points." },
    ],
  }),
  component: SummarizerPage,
});

type Section = keyof Pick<MeetingResult, "actionItems" | "decisions" | "deadlines" | "keyPoints">;

const SECTIONS: { key: Section; title: string; icon: typeof ListChecks }[] = [
  { key: "actionItems", title: "Action items", icon: ListChecks },
  { key: "decisions", title: "Decisions", icon: Gavel },
  { key: "deadlines", title: "Deadlines", icon: CalendarClock },
  { key: "keyPoints", title: "Key points", icon: Lightbulb },
];

function toPlainText(r: MeetingResult) {
  return [
    "SUMMARY",
    r.summary,
    "",
    ...SECTIONS.flatMap(({ key, title }) => [title.toUpperCase(), ...r[key].map((i) => `- ${i}`), ""]),
  ].join("\n");
}

function SummarizerPage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const variant = useRef(0);

  async function run(regenerate = false) {
    if (notes.trim().split(/\s+/).length < 15) {
      setError("Paste at least a few lines of notes so there's something to work with.");
      toast.error("Notes look too short");
      return;
    }
    setError("");
    setBusy(true);
    if (regenerate) variant.current += 1;
    try {
      await sleep(800 + Math.random() * 700);
      setResult(summarizeMeeting(notes, variant.current));
      logActivity("summary", `Summarised ${notes.trim().split(/\s+/).length} words of notes`);
      toast.success(regenerate ? "Re-summarised" : "Summary ready");
    } catch {
      setError("Couldn't summarise those notes. Try again.");
      toast.error("Summarising failed");
    } finally {
      setBusy(false);
    }
  }

  function updateItem(section: Section, index: number, value: string) {
    setResult((prev) =>
      prev ? { ...prev, [section]: prev[section].map((v, i) => (i === index ? value : v)) } : prev,
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tool 02"
        title="Meeting Notes Summarizer"
        description="Drop in the raw notes. Get a tight summary plus the actions, decisions, deadlines and key points — all editable."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="card-elegant space-y-4 p-5">
          <div>
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={"Paste the notes here…\n\nWe agreed to move the launch to the 14th. Ravi will finalise pricing by Friday. Marketing needs the copy before EOW. Decision: we're dropping the free tier for now."}
              className="mt-1.5 min-h-72 resize-y"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "No notes yet"}
            </p>
          </div>

          {error ? (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="size-4" /> {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void run(false)} disabled={busy}>
              <Wand2 /> {busy ? "Reading notes…" : "Summarise"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setNotes("");
                setResult(null);
                setError("");
              }}
            >
              Clear notes
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          {busy && !result ? (
            <div className="card-elegant space-y-3 p-5">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${55 + ((i * 17) % 42)}%` }} />
              ))}
            </div>
          ) : result ? (
            <>
              <div className="card-elegant p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold">Summary</h2>
                  <OutputActions
                    text={toPlainText(result)}
                    busy={busy}
                    onRegenerate={() => void run(true)}
                    onClear={() => setResult(null)}
                    label="Summary"
                  />
                </div>
                <Textarea
                  value={result.summary}
                  onChange={(e) => setResult({ ...result, summary: e.target.value })}
                  className="min-h-28 resize-y text-sm leading-relaxed"
                  aria-label="Summary, editable"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {SECTIONS.map(({ key, title, icon: Icon }) => (
                  <div key={key} className="card-elegant p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="size-4 text-primary" /> {title}
                      </h3>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => void copyText(result[key].map((i) => `- ${i}`).join("\n"), title)}
                      >
                        Copy
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {result[key].map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-leaf" />
                          <Textarea
                            value={item}
                            onChange={(e) => updateItem(key, i, e.target.value)}
                            className="min-h-0 resize-none border-transparent bg-transparent px-1 py-0.5 text-sm shadow-none focus-visible:border-input field-sizing-content"
                            rows={1}
                            aria-label={`${title} item ${i + 1}`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="card-elegant grid min-h-72 place-items-center p-10 text-center">
              <div>
                <NotebookPen className="mx-auto mb-3 size-8 text-primary/60" />
                <p className="text-sm text-muted-foreground">
                  Your summary, actions, decisions and deadlines will appear here.
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
