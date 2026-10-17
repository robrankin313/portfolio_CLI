"use client";

import type { ReactNode } from "react";
import { profile } from "@/data/profile";
import { isTheme, prefersReducedMotion, setPrefs, THEMES, type ThemeName } from "@/lib/prefs";
import { completePath, lookup, resolvePath, root } from "@/lib/vfs";
import {
  About,
  Banner,
  Contact,
  Cowsay,
  Education,
  ExperienceLog,
  Help,
  HireMe,
  Listing,
  Neofetch,
  ProjectList,
  renderFile,
  Resume,
  Run,
  SkillsJson,
  Tree,
} from "./outputs";

export type Ctx = {
  args: string[];
  /** Everything after the command name, untokenized (for echo/cowsay). */
  rest: string;
  cwd: string;
  setCwd: (path: string) => void;
  theme: ThemeName;
  crt: boolean;
  history: string[];
  clear: () => void;
  openGui: () => void;
  startMatrix: () => void;
};

type Command = {
  name: string;
  aliases?: string[];
  usage?: string;
  summary: string;
  group: "explore" | "system" | "hidden";
  complete?: (cwd: string, partial: string) => string[];
  run: (ctx: Ctx) => ReactNode;
};

const Err = ({ children }: { children: ReactNode }) => <div className="text-danger">{children}</div>;

const openUrl = (url: string) => {
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
};

const openTargets: Record<string, string> = {
  linkedin: profile.linkedin,
  email: `mailto:${profile.email}`,
  ...(profile.resumeUrl ? { resume: profile.resumeUrl } : {}),
  ...Object.fromEntries(profile.extraLinks.map((l) => [l.label.toLowerCase(), l.href])),
};

const FORTUNES = [
  "There are two hard problems in AI engineering: evals, cache invalidation, and off-by-one errors.",
  "It works on my GPU.",
  "A prompt is a function whose type signature is vibes.",
  "Hallucinations are just retrieval you forgot to do.",
  "The model is 10% of the system. The other 90% pages you at 3am.",
  "Latency is a feature. Ask anyone who has watched a progress bar.",
  "Never deploy an LLM on a Friday. Never deploy a Kafka consumer on a Friday either.",
];

const pathCompleter = (cwd: string, partial: string) => completePath(cwd, partial);

export const commands: Command[] = [
  // ---- explore
  { name: "whoami", aliases: ["about"], summary: "who I am, in two paragraphs", group: "explore", run: () => <About /> },
  { name: "projects", summary: "things I've built, with numbers", group: "explore", run: () => <ProjectList /> },
  {
    name: "experience",
    aliases: ["xp", "work"],
    summary: "career history, git-log style",
    group: "explore",
    run: () => <ExperienceLog />,
  },
  { name: "skills", aliases: ["stack"], summary: "languages, frameworks, infra", group: "explore", run: () => <SkillsJson /> },
  { name: "education", summary: "degree", group: "explore", run: () => <Education /> },
  { name: "contact", summary: "email, LinkedIn, location", group: "explore", run: () => <Contact /> },
  {
    name: "resume",
    aliases: ["cv"],
    summary: "the PDF version",
    group: "explore",
    run: () => {
      if (profile.resumeUrl) openUrl(profile.resumeUrl);
      return <Resume />;
    },
  },
  {
    name: "neofetch",
    summary: "system info, but it's me",
    group: "explore",
    run: () => <Neofetch />,
  },
  {
    name: "gui",
    summary: "switch to the point-and-click view",
    group: "explore",
    run: (ctx) => {
      ctx.openGui();
      return <div className="text-muted">Switching to GUI view…</div>;
    },
  },

  // ---- system
  { name: "help", usage: "", summary: "this list", group: "system", run: () => <Help rows={helpRows()} /> },
  {
    name: "ls",
    usage: "[dir]",
    summary: "list files",
    group: "system",
    complete: pathCompleter,
    run: ({ args, cwd }) => {
      const target = args.find((a) => !a.startsWith("-")) ?? ".";
      const path = resolvePath(cwd, target);
      const node = lookup(path);
      if (!node) return <Err>ls: cannot access &apos;{target}&apos;: No such file or directory</Err>;
      if (node.type === "file") return <div>{node.name}</div>;
      return <Listing path={path} node={node} />;
    },
  },
  {
    name: "cd",
    usage: "<dir>",
    summary: "change directory",
    group: "system",
    complete: (cwd, partial) => completePath(cwd, partial, (n) => n.type === "dir"),
    run: ({ args, cwd, setCwd }) => {
      const target = args[0] ?? "~";
      const path = resolvePath(cwd, target);
      const node = lookup(path);
      if (!node) return <Err>cd: no such file or directory: {target}</Err>;
      if (node.type !== "dir") return <Err>cd: not a directory: {target}</Err>;
      setCwd(path);
      return null;
    },
  },
  {
    name: "cat",
    usage: "<file>",
    summary: "print a file",
    group: "system",
    complete: pathCompleter,
    run: ({ args, cwd }) => {
      if (!args[0]) return <Err>usage: cat &lt;file&gt; (try `ls`)</Err>;
      const node = lookup(resolvePath(cwd, args[0]));
      if (!node) return <Err>cat: {args[0]}: No such file or directory</Err>;
      if (node.type === "dir") return <Err>cat: {args[0]}: Is a directory</Err>;
      if (node.view.kind === "resume" && profile.resumeUrl) openUrl(profile.resumeUrl);
      return renderFile(node.view);
    },
  },
  { name: "tree", summary: "show the whole filesystem", group: "system", run: () => <Tree node={root as Extract<typeof root, { type: "dir" }>} /> },
  {
    name: "open",
    usage: "<target>",
    summary: `open ${Object.keys(openTargets).join(" | ")}`,
    group: "system",
    complete: (_cwd, partial) => Object.keys(openTargets).filter((t) => t.startsWith(partial)),
    run: ({ args }) => {
      const url = openTargets[args[0]?.toLowerCase() ?? ""];
      if (!url) {
        return (
          <div>
            usage: open{" "}
            {Object.keys(openTargets).map((t) => (
              <span key={t} className="mr-2">
                <Run cmd={`open ${t}`} className="text-accent-2">
                  {t}
                </Run>
              </span>
            ))}
          </div>
        );
      }
      openUrl(url);
      return <div className="text-muted">Opening {url.replace(/^mailto:/, "")}…</div>;
    },
  },
  {
    name: "theme",
    usage: "[name]",
    summary: "change colors",
    group: "system",
    complete: (_cwd, partial) => THEMES.map((t) => t.name).filter((n) => n.startsWith(partial)),
    run: ({ args, theme }) => {
      const wanted = args[0]?.toLowerCase();
      if (wanted) {
        if (!isTheme(wanted)) return <Err>theme: unknown theme &apos;{wanted}&apos;</Err>;
        setPrefs({ theme: wanted });
        return <div className="text-muted">Theme set to {wanted}.</div>;
      }
      return (
        <div>
          {THEMES.map((t) => (
            <div key={t.name}>
              <span className="inline-block w-4 text-accent">{t.name === theme ? "›" : ""}</span>
              <Run cmd={`theme ${t.name}`} className="text-accent-2">
                {t.name}
              </Run>
              <span className="text-muted"> {t.label}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "crt",
    usage: "[on|off]",
    summary: "toggle scanlines + glow",
    group: "system",
    complete: (_cwd, partial) => ["on", "off"].filter((n) => n.startsWith(partial)),
    run: ({ args, crt }) => {
      const next = args[0] === "on" ? true : args[0] === "off" ? false : !crt;
      setPrefs({ crt: next });
      return <div className="text-muted">CRT effect {next ? "on" : "off"}.</div>;
    },
  },
  {
    name: "history",
    summary: "commands you've run",
    group: "system",
    run: ({ history }) => (
      <div>
        {history.map((h, i) => (
          <div key={i}>
            <span className="inline-block w-10 text-right text-muted">{i + 1}</span>{" "}
            <Run cmd={h}>{h}</Run>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: "clear",
    summary: "clear the screen",
    group: "system",
    run: ({ clear }) => {
      clear();
      return null;
    },
  },

  // ---- hidden
  { name: "banner", summary: "", group: "hidden", run: () => <Banner /> },
  { name: "pwd", summary: "", group: "hidden", run: ({ cwd }) => <div>/home/guest{cwd.slice(1)}</div> },
  { name: "echo", summary: "", group: "hidden", run: ({ rest }) => <div className="whitespace-pre-wrap">{rest}</div> },
  { name: "date", summary: "", group: "hidden", run: () => <div>{new Date().toString()}</div> },
  {
    name: "git",
    summary: "",
    group: "hidden",
    run: ({ args }) =>
      args[0] === "log" ? <ExperienceLog /> : <Err>git: only `git log` is available here (try it)</Err>,
  },
  {
    name: "sudo",
    summary: "",
    group: "hidden",
    run: ({ args }) => {
      if (["hire-me", "hire", "hire-robert"].includes(args[0])) return <HireMe />;
      if (!args[0]) return <Err>usage: sudo &lt;command&gt;</Err>;
      return (
        <div>
          <Err>guest is not in the sudoers file. This incident will be reported.</Err>
          <div className="text-muted">
            (psst… <Run cmd="sudo hire-me" />)
          </div>
        </div>
      );
    },
  },
  { name: "hire-me", aliases: ["hire"], summary: "", group: "hidden", run: () => <HireMe /> },
  {
    name: "matrix",
    summary: "",
    group: "hidden",
    run: ({ startMatrix }) => {
      if (prefersReducedMotion()) return <div className="text-muted">matrix: skipped (your system prefers reduced motion)</div>;
      startMatrix();
      return <div className="text-accent">Wake up, Neo… (press any key or click to exit)</div>;
    },
  },
  { name: "cowsay", summary: "", group: "hidden", run: ({ rest }) => <Cowsay text={rest} /> },
  {
    name: "fortune",
    summary: "",
    group: "hidden",
    run: () => <div className="italic">{FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}</div>,
  },
  {
    name: "rm",
    summary: "",
    group: "hidden",
    run: () => <Err>rm: permission denied. This portfolio is append-only.</Err>,
  },
  {
    name: "vim",
    aliases: ["vi", "nano", "emacs"],
    summary: "",
    group: "hidden",
    run: () => <div>You&apos;d never get out. Use `cat` instead.</div>,
  },
  {
    name: "ask",
    aliases: ["chat", "gpt", "claude", "llm"],
    summary: "",
    group: "hidden",
    run: () => (
      <div>
        <span className="text-accent-3">ask:</span> no model loaded, this is a static build. Building LLM systems is my day job,
        though: <Run cmd="projects" /> · <Run cmd="contact" />
      </div>
    ),
  },
  {
    name: "exit",
    aliases: ["logout", "quit"],
    summary: "",
    group: "hidden",
    run: () => (
      <div>
        There&apos;s no exit, only <Run cmd="gui" />.
      </div>
    ),
  },
  { name: "hello", aliases: ["hi", "hey"], summary: "", group: "hidden", run: () => <div>Hello, human. Try <Run cmd="help" />.</div> },
];

const byName = new Map<string, Command>();
for (const c of commands) for (const n of [c.name, ...(c.aliases ?? [])]) byName.set(n, c);

export const findCommand = (name: string) => byName.get(name.toLowerCase());

export function helpRows() {
  return commands
    .filter((c) => c.group !== "hidden")
    .map((c) => ({ name: c.name, usage: c.usage, summary: c.summary, group: c.group }));
}

export function suggest(name: string): string | null {
  let best: string | null = null;
  let bestScore = 3;
  for (const n of byName.keys()) {
    const d = distance(name.toLowerCase(), n);
    if (d < bestScore) [best, bestScore] = [n, d];
  }
  return best;
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** Tab completion. Returns the new input and, when ambiguous, the candidates to print. */
export function complete(input: string, cwd: string): { value: string; options: string[] } {
  const parts = input.split(/\s+/);
  if (parts.length === 1) {
    const names = commands.filter((c) => c.group !== "hidden").map((c) => c.name);
    const options = names.filter((n) => n.startsWith(parts[0]));
    return finish(input, parts[0], options, (o) => o + " ");
  }
  const cmd = findCommand(parts[0]);
  const partial = parts[parts.length - 1];
  const options = cmd?.complete?.(cwd, partial) ?? [];
  return finish(input, partial, options, (o) => (o.endsWith("/") ? o : o + " "));
}

function finish(input: string, partial: string, options: string[], decorate: (o: string) => string) {
  const head = input.slice(0, input.length - partial.length);
  if (options.length === 0) return { value: input, options: [] };
  if (options.length === 1) return { value: head + decorate(options[0]), options: [] };
  let prefix = options[0];
  for (const o of options) while (!o.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return { value: head + prefix, options: prefix.length > partial.length ? [] : options };
}
