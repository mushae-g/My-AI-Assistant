import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { clearActivity, useActivity } from "@/lib/activity";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — My AI Assistant" },
      { name: "description", content: "Set your display name, default tone and appearance for My AI Assistant." },
      { property: "og:title", content: "Settings — My AI Assistant" },
      { property: "og:description", content: "Personalise your assistant: name, default tone, theme and stored activity." },
    ],
  }),
  component: SettingsPage,
});

const KEY = "maia:settings";

interface Prefs {
  name: string;
  role: string;
  dark: boolean;
  concise: boolean;
}

const DEFAULTS: Prefs = { name: "", role: "", dark: false, concise: true };

function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const activity = useActivity();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", prefs.dark);
  }, [prefs.dark]);

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      toast.success("Preferences saved");
    } catch {
      toast.error("Couldn't save preferences in this browser");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Settings" description="Personal touches for how the assistant works and looks." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-elegant space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold">Your profile</h2>
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={prefs.name}
              onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
              placeholder="Sam Ndlovu"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="role">Role / team</Label>
            <Input
              id="role"
              value={prefs.role}
              onChange={(e) => setPrefs({ ...prefs, role: e.target.value })}
              placeholder="Product marketing"
              className="mt-1.5"
            />
          </div>
          <Button onClick={save}>Save preferences</Button>
        </section>

        <section className="card-elegant space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold">Assistant & appearance</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Concise outputs</p>
              <p className="text-xs text-muted-foreground">Prefer shorter drafts and tighter summaries.</p>
            </div>
            <Switch checked={prefs.concise} onCheckedChange={(v) => setPrefs({ ...prefs, concise: v })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Dark theme</p>
              <p className="text-xs text-muted-foreground">Softer teal palette for low light.</p>
            </div>
            <Switch checked={prefs.dark} onCheckedChange={(v) => setPrefs({ ...prefs, dark: v })} />
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium">Stored activity</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {activity.length} item{activity.length === 1 ? "" : "s"} kept in this browser only. Nothing leaves your device.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearActivity();
                toast.success("Activity history cleared");
              }}
            >
              Clear activity history
            </Button>
          </div>
        </section>
      </div>

      <Disclaimer className="mt-6" />
    </div>
  );
}
