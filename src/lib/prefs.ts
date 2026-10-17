import { useSyncExternalStore } from "react";
import { PREFS_KEY } from "./theme-script";

export const THEMES = [
  { name: "green", label: "Phosphor green" },
  { name: "amber", label: "Amber CRT" },
  { name: "dracula", label: "Dracula" },
  { name: "paper", label: "Paper (light)" },
] as const;

export type ThemeName = (typeof THEMES)[number]["name"];
export type Mode = "terminal" | "gui";
type Prefs = { theme: ThemeName; crt: boolean };

const DEFAULT_PREFS: Prefs = { theme: "green", crt: true };

export function isTheme(value: string): value is ThemeName {
  return THEMES.some((t) => t.name === value);
}

// ---- theme + CRT preferences (persisted in localStorage) ----

let prefs: Prefs | null = null;
const prefListeners = new Set<() => void>();

function readPrefs(): Prefs {
  if (prefs) return prefs;
  prefs = DEFAULT_PREFS;
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null");
    if (saved && isTheme(saved.theme)) prefs = { theme: saved.theme, crt: saved.crt !== false };
  } catch {}
  return prefs;
}

export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...readPrefs(), ...patch };
  document.documentElement.dataset.theme = prefs.theme;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
  prefListeners.forEach((l) => l());
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (l) => {
      prefListeners.add(l);
      return () => prefListeners.delete(l);
    },
    readPrefs,
    () => DEFAULT_PREFS,
  );
}

// ---- terminal vs GUI mode (lives in the URL hash so #gui is shareable) ----

const modeListeners = new Set<() => void>();

export function setMode(mode: Mode) {
  const url = mode === "gui" ? "#gui" : location.pathname + location.search;
  history.pushState(null, "", url);
  modeListeners.forEach((l) => l());
}

export function useMode(): Mode {
  return useSyncExternalStore(
    (l) => {
      modeListeners.add(l);
      window.addEventListener("popstate", l);
      window.addEventListener("hashchange", l);
      return () => {
        modeListeners.delete(l);
        window.removeEventListener("popstate", l);
        window.removeEventListener("hashchange", l);
      };
    },
    () => (location.hash === "#gui" ? "gui" : "terminal"),
    () => "terminal",
  );
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
