import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  NotebookPen,
  Telescope,
  MessagesSquare,
  Settings as SettingsIcon,
  Menu,
  Leaf,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sprig } from "@/components/Floral";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/summarizer", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/research", label: "Research Assistant", icon: Telescope },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft",
          }}
        >
          <Icon className="size-4.5 shrink-0 opacity-80" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Leaf className="size-4.5" />
      </span>
      <span className="font-display text-lg leading-tight font-semibold">
        My AI <span className="text-gradient-brand">Assistant</span>
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen surface-glow">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-sm lg:flex">
        <div className="relative overflow-hidden py-6">
          <Brand />
          <Sprig className="absolute -right-6 -top-4 h-24 w-24 text-leaf/40" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavList />
        </div>
        <div className="border-t border-sidebar-border p-4 text-xs leading-relaxed text-muted-foreground">
          Simulated AI prototype. Always review output before professional use.
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="py-6">
              <Brand />
            </div>
            <div className="px-3">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Brand />
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
