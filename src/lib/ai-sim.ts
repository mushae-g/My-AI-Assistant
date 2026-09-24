/**
 * Client-side simulated AI engine.
 * No backend, no network calls — everything is derived from the user's own
 * input so the output feels specific rather than canned.
 */

export type Tone = "formal" | "friendly" | "persuasive";

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","then","else","for","to","of","in","on","at","by","with","from","as","is","are","was","were","be","been","being","it","its","this","that","these","those","we","our","us","you","your","i","me","my","they","them","their","he","she","his","her","will","would","can","could","should","shall","may","might","must","do","does","did","have","has","had","not","no","so","than","too","very","just","about","into","over","after","before","also","more","most","some","any","each","which","who","what","when","where","how","there","here","up","down","out","again","because","while","during","per","via","let","lets",
]);

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

export function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9'’-]{2,}/g) ?? [];
}

export function keywords(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const w of words(text)) {
    if (STOP_WORDS.has(w) || w.length < 3) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

export function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Deterministic-ish variation seed so "Regenerate" gives a different take. */
export function pick<T>(arr: T[], variant: number): T {
  return arr[variant % arr.length]!;
}

/** Rank sentences by keyword density — a tiny extractive summarizer. */
export function rankSentences(text: string, take: number): string[] {
  const kw = new Set(keywords(text, 14));
  const scored = sentences(text).map((s, i) => {
    const ws = words(s);
    const hits = ws.filter((w) => kw.has(w)).length;
    return { s, i, score: hits / Math.sqrt(ws.length || 1) };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
}

/* ---------------------------------- Email --------------------------------- */

export interface EmailInput {
  instruction: string;
  tone: Tone;
  recipient: string;
  sender: string;
}

export function generateEmail(input: EmailInput, variant = 0): string {
  const { instruction, tone, recipient, sender } = input;
  const kw = keywords(instruction, 6);
  const topic = kw.slice(0, 3).map(titleCase).join(" · ") || "Quick note";
  const to = recipient.trim() || "there";
  const from = sender.trim() || "Your name";
  const points = sentences(instruction).slice(0, 4);
  const detail = points.length ? points : [instruction.trim()];

  const subjects: Record<Tone, string[]> = {
    formal: [`Regarding ${topic}`, `${topic} — for your review`, `Follow-up: ${topic}`],
    friendly: [`Quick one about ${topic}`, `${topic} — thought you'd want this`, `Checking in on ${topic}`],
    persuasive: [`Why ${topic} matters now`, `A better path for ${topic}`, `${topic}: worth 5 minutes of your time`],
  };
  const openers: Record<Tone, string[]> = {
    formal: [`Dear ${to},`, `Hello ${to},`],
    friendly: [`Hi ${to},`, `Hey ${to},`],
    persuasive: [`Hi ${to},`, `${capitalize(to)},`],
  };
  const leadIns: Record<Tone, string[]> = {
    formal: [
      "I hope this message finds you well. I am writing to you regarding the following:",
      "I wanted to formally bring the following to your attention:",
    ],
    friendly: [
      "Hope your week is going well! I wanted to share something with you:",
      "Quick note from my side — here's what's on my mind:",
    ],
    persuasive: [
      "I'll keep this short, because I think it's genuinely worth your attention:",
      "There's a clear opportunity here, and I'd rather flag it early than late:",
    ],
  };
  const closers: Record<Tone, string[]> = {
    formal: [
      "Please let me know if you require any further detail. I would be glad to provide it.",
      "I would appreciate your thoughts at your earliest convenience.",
    ],
    friendly: [
      "Let me know what you think — happy to jump on a quick call if that's easier.",
      "No rush at all, just shout if you'd like to talk it through.",
    ],
    persuasive: [
      "If this lands well, I can have the next step ready within 48 hours — just say the word.",
      "Give me a yes and I'll take it from here. Give me a no and I'll close the loop cleanly.",
    ],
  };
  const signoffs: Record<Tone, string> = {
    formal: "Kind regards,",
    friendly: "Thanks so much,",
    persuasive: "Looking forward,",
  };

  const body = detail
    .map((p) => {
      const t = p.replace(/^[-•*]\s*/, "").trim();
      const s = capitalize(t.endsWith(".") ? t : `${t}.`);
      if (tone === "persuasive") return `• ${s}`;
      return s;
    })
    .join(tone === "persuasive" ? "\n" : "\n\n");

  return [
    `Subject: ${pick(subjects[tone], variant)}`,
    "",
    pick(openers[tone], variant),
    "",
    pick(leadIns[tone], variant),
    "",
    body,
    "",
    pick(closers[tone], variant),
    "",
    signoffs[tone],
    from,
  ].join("\n");
}

/* ------------------------------ Meeting notes ------------------------------ */

export interface MeetingResult {
  summary: string;
  actionItems: string[];
  decisions: string[];
  deadlines: string[];
  keyPoints: string[];
}

const ACTION_HINTS = /\b(will|should|need to|needs to|must|action|assign|follow up|follow-up|take on|owns|responsible|to do|todo|next step)\b/i;
const DECISION_HINTS = /\b(decided|decision|agreed|approved|rejected|concluded|we will go with|signed off|confirmed)\b/i;
const DEADLINE_HINTS =
  /\b(by |due |deadline|before |eod|eow|next week|this week|friday|monday|tuesday|wednesday|thursday|saturday|sunday|q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}|\d{1,2}(st|nd|rd|th))\b/i;

export function summarizeMeeting(notes: string, variant = 0): MeetingResult {
  const all = sentences(notes);
  const kw = keywords(notes, 6);
  const top = rankSentences(notes, Math.min(4, Math.max(2, Math.ceil(all.length / 5))));

  const clean = (s: string) => capitalize(s.replace(/^[-•*\d.)\s]+/, "").trim().replace(/\.$/, ""));

  const actionItems = all.filter((s) => ACTION_HINTS.test(s)).map(clean);
  const decisions = all.filter((s) => DECISION_HINTS.test(s)).map(clean);
  const deadlines = all.filter((s) => DEADLINE_HINTS.test(s)).map(clean);
  const keyPoints = (top.length ? top : all.slice(0, 3)).map(clean);

  const frames = [
    `The discussion centred on ${kw.slice(0, 3).join(", ") || "the agenda items"}.`,
    `This session focused mainly on ${kw.slice(0, 3).join(", ") || "the topics raised"}.`,
    `Key attention in this meeting went to ${kw.slice(0, 3).join(", ") || "the items below"}.`,
  ];

  const summary = [
    pick(frames, variant),
    top.slice(0, 2).map((s) => clean(s) + ".").join(" "),
    `${actionItems.length} action item${actionItems.length === 1 ? "" : "s"} and ${decisions.length} decision${decisions.length === 1 ? "" : "s"} were captured${deadlines.length ? `, with ${deadlines.length} dated commitment${deadlines.length === 1 ? "" : "s"}` : ""}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const fallback = (arr: string[], msg: string) => (arr.length ? [...new Set(arr)].slice(0, 6) : [msg]);

  return {
    summary,
    actionItems: fallback(actionItems, "No explicit owner-assigned actions were detected — consider adding them."),
    decisions: fallback(decisions, "No firm decisions were recorded in these notes."),
    deadlines: fallback(deadlines, "No dates or deadlines were mentioned."),
    keyPoints: fallback(keyPoints, "Notes were too short to extract distinct key points."),
  };
}

/* ---------------------------------- Research -------------------------------- */

export interface ResearchResult {
  overview: string;
  insights: string[];
  recommendations: string[];
  questions: string[];
}

export function researchTopic(input: string, variant = 0): ResearchResult {
  const kw = keywords(input, 10);
  const isArticle = input.trim().split(/\s+/).length > 40;
  const subject = isArticle ? kw.slice(0, 3).join(", ") : input.trim().replace(/\.$/, "");
  const core = rankSentences(input, 3);
  const clean = (s: string) => capitalize(s.replace(/^[-•*\d.)\s]+/, "").trim().replace(/\.$/, ""));

  const overviews = [
    `${capitalize(subject)} sits at the intersection of ${kw.slice(0, 2).join(" and ") || "practice and strategy"}. ${isArticle ? core.map(clean).join(". ") + "." : `The material below breaks it into what matters, why it matters, and what to do next.`}`,
    `Working definition: ${capitalize(subject)} is best understood through its drivers — ${kw.slice(0, 3).join(", ") || "context, constraints and outcomes"}. ${isArticle ? clean(core[0] ?? "") + "." : "Treat the insights below as a starting map rather than a final answer."}`,
    `${capitalize(subject)} rewards a structured read. ${isArticle ? core.map(clean).join(". ") + "." : `Focus first on ${kw[0] ?? "scope"}, then on ${kw[1] ?? "constraints"}, then on measurable impact.`}`,
  ];

  const insightTemplates = [
    (k: string) => `${titleCase(k)} is a recurring pressure point — it shapes cost, timing and perceived quality more than it first appears.`,
    (k: string) => `Most failures around ${k} come from unclear ownership rather than lack of effort.`,
    (k: string) => `${titleCase(k)} compounds: small early improvements tend to outperform large late corrections.`,
    (k: string) => `There is usually a measurable proxy for ${k}; picking one early makes progress arguable rather than anecdotal.`,
    (k: string) => `Stakeholders describe ${k} in different vocabularies, which hides genuine agreement.`,
  ];

  const recTemplates = [
    (k: string) => `Define one owner and one success metric for ${k} before adding scope.`,
    (k: string) => `Run a two-week baseline on ${k} so later changes can be compared, not guessed.`,
    (k: string) => `Document the top three assumptions behind ${k} and list what would disprove each.`,
    (k: string) => `Timebox a small pilot on ${k}; keep it reversible and cheap to abandon.`,
    (k: string) => `Summarise ${k} in one page for stakeholders — alignment usually costs less than rework.`,
  ];

  const seeds = kw.length ? kw : ["the topic", "scope", "impact"];
  const rotate = <T,>(arr: T[], n: number) => arr.slice(n % arr.length).concat(arr.slice(0, n % arr.length));

  const insights = rotate(insightTemplates, variant)
    .slice(0, 4)
    .map((fn, i) => fn(seeds[i % seeds.length]!));
  const recommendations = rotate(recTemplates, variant + 1)
    .slice(0, 4)
    .map((fn, i) => fn(seeds[(i + 1) % seeds.length]!));

  const questions = [
    `What evidence would change your current view on ${seeds[0]}?`,
    `Who is accountable for ${seeds[1 % seeds.length]} today, and do they know it?`,
    `What is the cost of doing nothing for another quarter?`,
  ];

  return { overview: pick(overviews, variant), insights, recommendations, questions };
}

/* ----------------------------------- Chat ---------------------------------- */

export function chatReply(prompt: string, history: { role: string; content: string }[], variant = 0): string {
  const p = prompt.trim();
  const lower = p.toLowerCase();
  const kw = keywords(p, 5);
  const topic = kw.slice(0, 2).join(" and ") || "that";
  const turn = history.filter((m) => m.role === "user").length;

  if (/^(hi|hey|hello|good (morning|afternoon|evening))\b/.test(lower)) {
    return `Hello! I'm My AI Assistant. I can draft emails, summarise meeting notes, research a topic, or just think out loud with you. What's on your plate${turn > 1 ? " now" : ""}?`;
  }
  if (/\b(thanks|thank you|cheers)\b/.test(lower)) {
    return "Anytime. If you want, I can turn any of this into a draft email or a summary you can share.";
  }
  if (/\b(who|what) are you\b/.test(lower)) {
    return "I'm My AI Assistant — a workplace assistant prototype. Everything I produce here is simulated on your device, so treat it as a drafting aid rather than a source of truth.";
  }

  const isQuestion = /\?$/.test(p) || /^(how|why|what|when|where|can|should|is|are|do|does|could|would)\b/.test(lower);

  const openings = [
    `Here's how I'd approach ${topic}:`,
    `Good question — let me break ${topic} down:`,
    `Thinking about ${topic}, three things stand out:`,
  ];
  const closings = [
    `Want me to draft this as an email you could send?`,
    `If you paste in more detail, I can tighten this into a one-pager.`,
    `Happy to go deeper on any single point.`,
  ];

  const body = isQuestion
    ? [
        `1. **Frame it.** Be explicit about what "done" looks like for ${kw[0] ?? "this"} — most confusion lives here.`,
        `2. **Find the constraint.** Usually one of time, ${kw[1] ?? "budget"} or approval is the real bottleneck; the rest is noise.`,
        `3. **Pick a first move.** Something small, reversible and visible within a week beats a perfect plan next month.`,
      ].join("\n")
    : [
        `• I read this as being mainly about ${topic}.`,
        `• The practical lever is ${kw[0] ?? "clarity"}: name an owner, a date and a measure.`,
        `• Risk to watch: ${kw[2] ?? "scope"} drifting quietly while everyone assumes someone else is tracking it.`,
      ].join("\n");

  return `${pick(openings, variant + turn)}\n\n${body}\n\n${pick(closings, variant + turn)}`;
}
