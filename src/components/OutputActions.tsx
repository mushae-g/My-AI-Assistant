import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export async function copyText(text: string, label = "Output") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Couldn't access the clipboard — select the text and copy manually.");
  }
}

export function OutputActions({
  text,
  onRegenerate,
  onClear,
  busy,
  label,
}: {
  text: string;
  onRegenerate: () => void;
  onClear?: () => void;
  busy?: boolean;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => void copyText(text, label)}>
        <Copy /> Copy
      </Button>
      <Button variant="outline" size="sm" onClick={onRegenerate} disabled={busy}>
        <RefreshCw className={busy ? "animate-spin" : ""} /> Regenerate
      </Button>
      {onClear ? (
        <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
          <Trash2 /> Clear
        </Button>
      ) : null}
    </div>
  );
}
