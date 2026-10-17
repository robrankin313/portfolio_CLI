"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { jobs, profile, projects } from "@/data/profile";
import { prefersReducedMotion, setMode, setPrefs, THEMES, usePrefs } from "@/lib/prefs";
import MatrixRain from "../MatrixRain";
import { complete, findCommand, suggest } from "./commands";
import { Neofetch, Run, RunContext, Welcome } from "./outputs";

type Entry = { id: number; cwd: string; input: string; output: ReactNode };

const BOOT: { text: string; ms: number; ok?: boolean }[] = [
  { text: "RankinOS 12.0 LTS — tty1", ms: 220 },
  { text: "Reached target 12+ Years of Backend Engineering.", ms: 110, ok: true },
  { text: "Started LLM Orchestration Service (langchain, langgraph).", ms: 110, ok: true },
  { text: "Started CUDA Inference Workers (KV-cache warm).", ms: 130, ok: true },
  { text: `Mounted /home/guest/projects (${projects.length} case studies).`, ms: 90, ok: true },
  { text: `Mounted /home/guest/experience (${jobs.length} roles).`, ms: 90, ok: true },
  { text: "Started Telemetry Ingest (30M events/day).", ms: 110, ok: true },
  { text: "Reached target Graphical Interface (type `gui`).", ms: 160, ok: true },
  { text: "         Starting rankin-shell…", ms: 320 },
];

const CHIPS = ["help", "whoami", "projects", "experience", "skills", "contact", "gui"];

const finePointer = () => window.matchMedia("(pointer: fine)").matches;

function Prompt({ cwd }: { cwd: string }) {
  return (
    <span className="mr-[1ch] shrink-0 select-none">
      <span className="font-bold text-accent">guest@{profile.host}</span>
      <span className="text-muted">:</span>
      <span className="font-bold text-accent-2">{cwd}</span>
      <span className="text-muted">$</span>
    </span>
  );
}

export default function Terminal({ active }: { active: boolean }) {
  const { theme, crt } = usePrefs();
  const [bootStep, setBootStep] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [cwd, setCwd] = useState("~");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [matrix, setMatrix] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [clock, setClock] = useState("--:--");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const booted = bootStep >= BOOT.length;

  // ---- boot sequence (instant on repeat visits and for reduced motion)
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("rr-booted") === "1";
    } catch {}
    if (bootStep >= BOOT.length) {
      try {
        sessionStorage.setItem("rr-booted", "1");
      } catch {}
      return;
    }
    const fast = seen || prefersReducedMotion();
    const t = setTimeout(() => setBootStep(fast ? BOOT.length : bootStep + 1), fast ? 0 : BOOT[bootStep].ms);
    return () => clearTimeout(t);
  }, [bootStep]);

  useEffect(() => {
    if (booted && active && finePointer()) inputRef.current?.focus({ preventScroll: true });
  }, [booted, active]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  // ---- keep the newest output in view (from its top when it's taller than the screen)
  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const last = lastEntryRef.current;
    if (last && last.offsetHeight > box.clientHeight - 64) box.scrollTop = last.offsetTop - 8;
    else box.scrollTop = box.scrollHeight;
  }, [entries, bootStep, showIntro]);

  const push = useCallback((cwdAt: string, raw: string, output: ReactNode) => {
    setEntries((list) => [...list, { id: nextId.current++, cwd: cwdAt, input: raw, output }]);
  }, []);

  const execute = (raw: string) => {
    setBootStep(BOOT.length);
    setInput("");
    setCaret(0);
    setHistIndex(null);
    const line = raw.trim();
    if (!line) return push(cwd, "", null);

    const nextHistory = history[history.length - 1] === line ? history : [...history, line];
    setHistory(nextHistory);

    const [name, ...args] = line.split(/\s+/);
    const rest = line.slice(name.length).trim();
    const cmd = findCommand(name);
    let cleared = false;
    let output: ReactNode;

    if (cmd) {
      output = cmd.run({
        args,
        rest,
        cwd,
        setCwd,
        theme,
        crt,
        history: nextHistory,
        clear: () => (cleared = true),
        openGui: () => setTimeout(() => setMode("gui"), 300),
        startMatrix: () => setMatrix(true),
      });
    } else {
      const guess = suggest(name);
      output = (
        <div>
          <span className="text-danger">command not found: {name}</span>
          {guess && (
            <>
              {" "}
              · did you mean <Run cmd={[guess, rest].filter(Boolean).join(" ")} className="text-accent" />?
            </>
          )}
          <div className="text-muted">
            type <Run cmd="help" /> for the list
          </div>
        </div>
      );
    }

    if (cleared) {
      setEntries([]);
      setShowIntro(false);
      return;
    }
    push(cwd, raw, output);
  };

  // Clicks in old scrollback must see current state, so route them through a ref.
  const executeRef = useRef(execute);
  useLayoutEffect(() => {
    executeRef.current = execute;
  });
  const run = useCallback((cmd: string) => {
    executeRef.current(cmd);
    if (finePointer()) inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Typing anywhere goes to the prompt; any key skips the boot animation.
  useEffect(() => {
    if (!active || matrix) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!booted) {
        setBootStep(BOOT.length);
        return;
      }
      const target = e.target as HTMLElement;
      if (target === inputRef.current || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 || e.key === "ArrowUp" || e.key === "Enter") {
        if (target.closest("a,button") && e.key === "Enter") return;
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, matrix, booted]);

  const setValue = (value: string) => {
    setInput(value);
    setCaret(value.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(value.length, value.length));
  };

  const recall = (dir: -1 | 1) => {
    if (!history.length) return;
    let i = histIndex === null ? (dir === -1 ? history.length - 1 : null) : histIndex + dir;
    if (i !== null && i < 0) i = 0;
    if (i !== null && i >= history.length) i = null;
    setHistIndex(i);
    setValue(i === null ? "" : history[i]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toLowerCase();
    if (e.key === "Enter") {
      e.preventDefault();
      execute(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!input.trim()) return;
      const result = complete(input, cwd);
      setValue(result.value);
      if (result.options.length) {
        push(
          cwd,
          input,
          <div className="flex flex-wrap gap-x-6 text-accent-2">
            {result.options.map((o) => (
              <span key={o}>{o}</span>
            ))}
          </div>,
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      recall(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      recall(1);
    } else if (e.ctrlKey && key === "l") {
      e.preventDefault();
      setEntries([]);
      setShowIntro(false);
    } else if (e.ctrlKey && key === "c" && e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
      e.preventDefault();
      push(cwd, input + "^C", null);
      setValue("");
    } else if (e.ctrlKey && key === "u") {
      e.preventDefault();
      setValue("");
    }
  };

  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? input.length);

  const focusFromClick = (e: MouseEvent) => {
    if (!booted) return setBootStep(BOOT.length);
    if ((e.target as HTMLElement).closest("a,button,input")) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const exitMatrix = useCallback(() => {
    setMatrix(false);
    if (finePointer()) inputRef.current?.focus({ preventScroll: true });
  }, []);

  const cycleTheme = () => {
    const i = THEMES.findIndex((t) => t.name === theme);
    setPrefs({ theme: THEMES[(i + 1) % THEMES.length].name });
  };

  const before = input.slice(0, caret);
  const atCaret = input.slice(caret, caret + 1);
  const after = input.slice(caret + 1);

  return (
    <main
      hidden={!active}
      className={`term-bg relative h-dvh w-full overflow-hidden ${maximized ? "p-0" : "p-0 sm:p-5 lg:p-8"}`}
    >
      <div
        data-crt={crt ? "on" : "off"}
        className={`crt relative mx-auto flex h-full w-full flex-col overflow-hidden border-line bg-term font-mono text-[13px] text-fg shadow-[0_0_80px_-20px_var(--glow)] sm:text-sm ${
          maximized ? "max-w-none" : "max-w-6xl sm:rounded-xl sm:border"
        }`}
      >
        {/* title bar */}
        <div className="flex h-9 shrink-0 items-center gap-3 border-b border-line bg-panel px-3 text-xs text-muted select-none">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden />
            <button
              type="button"
              onClick={() => setMaximized((m) => !m)}
              className="h-3 w-3 cursor-pointer rounded-full bg-[#28c840] hover:brightness-110"
              aria-label={maximized ? "Restore window" : "Maximize window"}
              title={maximized ? "Restore" : "Maximize"}
            />
          </div>
          <div className="min-w-0 flex-1 truncate text-center">
            guest@{profile.host}: {cwd} — zsh
          </div>
          <button type="button" onClick={cycleTheme} className="cursor-pointer hover:text-accent" title="Cycle theme">
            theme
          </button>
          <button
            type="button"
            onClick={() => setMode("gui")}
            className="cursor-pointer rounded border border-line px-1.5 py-0.5 hover:border-accent hover:text-accent"
          >
            GUI view
          </button>
        </div>

        {/* scrollback */}
        <RunContext.Provider value={run}>
          <div
            ref={scrollRef}
            onClick={focusFromClick}
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            className="term-scroll relative flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 leading-relaxed sm:px-5"
          >
            {showIntro && (
              <div className="boot">
                {BOOT.slice(0, bootStep).map((b) => (
                  <div key={b.text} className="whitespace-pre-wrap">
                    {b.ok && (
                      <span>
                        [<span className="text-accent">  OK  </span>]{" "}
                      </span>
                    )}
                    <span className={b.ok ? "" : "text-muted"}>{b.text}</span>
                  </div>
                ))}
                {booted && (
                  <div className="fade-in mt-4">
                    <Neofetch />
                    <Welcome />
                  </div>
                )}
              </div>
            )}

            {entries.map((e, i) => (
              <div key={e.id} ref={i === entries.length - 1 ? lastEntryRef : undefined} className="mt-3 first:mt-4">
                <div className="flex flex-wrap break-all">
                  <Prompt cwd={e.cwd} />
                  <span>{e.input}</span>
                </div>
                {e.output && <div className="fade-in mt-1">{e.output}</div>}
              </div>
            ))}

            {booted && (
              <label className="mt-3 flex cursor-text flex-wrap">
                <Prompt cwd={cwd} />
                <span className="relative min-w-[1ch] flex-1 break-all whitespace-pre-wrap">
                  <span aria-hidden>
                    {before}
                    <span className={`cursor ${focused ? "cursor-on" : "cursor-off"}`}>{atCaret || " "}</span>
                    {after}
                  </span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setCaret(e.target.selectionStart ?? e.target.value.length);
                      setHistIndex(null);
                    }}
                    onKeyDown={onKeyDown}
                    onKeyUp={syncCaret}
                    onSelect={syncCaret}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-label="Type a command and press Enter"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    className="absolute inset-0 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none"
                  />
                </span>
              </label>
            )}
            <div className="h-6" />
          </div>

          {/* quick commands */}
          <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-line bg-panel/60 px-3 py-2 text-xs [scrollbar-width:none] sm:px-5">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => run(c)}
                className="shrink-0 cursor-pointer rounded border border-line px-2 py-1 text-fg/80 transition-colors hover:border-accent hover:text-accent"
              >
                {c}
              </button>
            ))}
          </div>
        </RunContext.Provider>

        {/* tmux-style status bar */}
        <div className="flex h-6 shrink-0 items-center gap-3 bg-accent px-3 text-[11px] font-bold text-term select-none">
          <span>[{profile.host}] 0:zsh*</span>
          <span className="hidden flex-1 truncate text-center font-normal opacity-80 md:block">
            tab: complete · ↑↓: history · ctrl+l: clear · click anything underlined
          </span>
          <span className="ml-auto flex items-center gap-3 md:ml-0">
            {profile.available && <span className="hidden sm:inline">● open to work</span>}
            <span>{theme}</span>
            <span suppressHydrationWarning>{clock}</span>
          </span>
        </div>
      </div>

      {matrix && <MatrixRain onExit={exitMatrix} />}
    </main>
  );
}
