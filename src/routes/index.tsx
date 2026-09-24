import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, Telescope, MessagesSquare, ArrowRight, Sparkle, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { FloralCorner, Sprig } from "@/components/Floral";
import { useActivity, relativeTime } from "@/lib/activity";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — My AI Assistant" },
      {
        name: "description",
        content:
          "My AI Assistant: draft emails, summarise meeting notes, research topics and chat — a polished AI workspace prototype.",
      },
      { property: "og:title", content: "Dashboard — My AI Assistant" },
      {
        property: "og:description",
        content: "Draft emails, summarise meetings, research topics and chat in one calm AI workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    label: "Smart Email Generator",
    blurb: "Turn a one-line instruction into a polished email in the tone you choose.",
    icon: Mail,
  },
  {
    to: "/summarizer",
    label: "Meeting Summarizer",
    blurb: "Paste raw notes, get a summary plus actions, decisions and deadlines.",
    icon: NotebookPen,
  },
  {
    to: "/research",
    label: "Research Assistant",
    blurb: "Structure any topic or article into insights and practical next steps.",
    icon: Telescope,
  },
  { to: "/chat", label: "AI Chat", blurb: "Think out loud with a workplace assistant that keeps context.", icon: MessagesSquare },
] as const;

function Dashboard() {
  const activity = useActivity();
  const counts = {
    email: activity.filter((a) => a.kind === "email").length,
    summary: activity.filter((a) => a.kind === "summary").length,
    research: activity.filter((a) => a.kind === "research").length,
    chat: activity.filter((a) => a.kind === "chat").length,
  };
  const total = activity.length;
  const minutesSaved = counts.email * 6 + counts.summary * 12 + counts.research * 15 + counts.chat * 2;

  const stats = [
    { label: "Tasks completed", value: total, hint: "this browser session" },
    { label: "Minutes saved", value: minutesSaved, hint: "estimated" },
    { label: "Emails drafted", value: counts.email, hint: "all tones" },
    { label: "Notes summarised", value: counts.summary, hint: "meetings" },
  ];

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-10">
        <FloralCorner className="inset-0" />
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkle className="size-3.5" /> Your workspace, calmer
        </p>
        <h1 className="max-w-xl text-3xl font-semibold sm:text-4xl">
          Welcome to <span className="text-gradient-brand">My AI Assistant</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Four focused tools for everyday work: write the email, tidy the meeting, understand the topic, and think it
          through out loud.
        </p>
        <Link
          to="/email"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
        >
          Start with an email <ArrowRight className="size-4" />
        </Link>
      </section>

      <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {TOOLS.map(({ to, label, blurb, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="card-elegant group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <Sprig className="absolute -right-6 -bottom-8 h-28 w-28 text-leaf/25 transition-transform group-hover:scale-110" />
            <span className="mb-3 grid size-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <h3 className="font-display text-lg font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section className="card-elegant p-5">
          <h2 className="mb-4 text-lg font-semibold">Productivity statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 p-4">
                <p className="font-display text-3xl font-semibold text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Weekly goal — 20 assisted tasks</span>
              <span>{Math.min(total, 20)}/20</span>
            </div>
            <Progress value={Math.min(total / 20, 1) * 100} />
          </div>
        </section>

        <section className="card-elegant relative overflow-hidden p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
          {activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nothing yet. Generate an email or summary and it will appear here.
            </div>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-accent-foreground">
                    {a.kind === "email" ? (
                      <Mail className="size-4" />
                    ) : a.kind === "summary" ? (
                      <NotebookPen className="size-4" />
                    ) : a.kind === "research" ? (
                      <Telescope className="size-4" />
                    ) : (
                      <MessagesSquare className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="size-3" /> {relativeTime(a.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Disclaimer />
    </div>
  );
}
