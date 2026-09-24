import { useSyncExternalStore } from "react";

export type ActivityKind = "email" | "summary" | "research" | "chat";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  at: number;
}

const KEY = "maia:activity";
let items: ActivityItem[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw) as ActivityItem[];
  } catch {
    items = [];
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — keep in memory */
    }
  }
  listeners.forEach((l) => l());
}

export function logActivity(kind: ActivityKind, title: string) {
  load();
  items = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, title, at: Date.now() }, ...items].slice(
    0,
    40,
  );
  emit();
}

export function clearActivity() {
  items = [];
  emit();
}

export function useActivity(): ActivityItem[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return items;
    },
    () => [],
  );
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}
