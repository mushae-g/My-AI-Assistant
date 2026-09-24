import { ShieldCheck } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex gap-3 rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground ${className}`}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        <span className="font-semibold text-foreground">Responsible AI:</span> this assistant produces simulated,
        AI-style drafts. Review every output for accuracy, tone and bias, remove confidential or personal information
        before sharing, and keep a human decision-maker accountable for anything sent externally.
      </p>
    </div>
  );
}
