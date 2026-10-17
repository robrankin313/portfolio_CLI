"use client";

import { createContext, useContext, type ReactNode } from "react";
import { education, jobs, profile, projects, skills } from "@/data/profile";
import { blockText, CHIP, shortHash } from "@/lib/ascii";
import { join, type FileView, type FsNode } from "@/lib/vfs";

// Clicking any <Run> in the scrollback types and executes that command.
export const RunContext = createContext<(cmd: string) => void>(() => {});

export function Run({ cmd, children, className = "" }: { cmd: string; children?: ReactNode; className?: string }) {
  const run = useContext(RunContext);
  return (
    <button
      type="button"
      onClick={() => run(cmd)}
      title={`Run: ${cmd}`}
      className={`cursor-pointer underline decoration-dotted decoration-1 underline-offset-4 hover:bg-accent hover:text-term hover:no-underline focus-visible:bg-accent focus-visible:text-term focus-visible:outline-none ${className}`}
    >
      {children ?? cmd}
    </button>
  );
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="text-accent-2 underline decoration-1 underline-offset-4 hover:bg-accent-2 hover:text-term hover:no-underline"
    >
      {children}
    </a>
  );
}

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="mr-2 inline-block whitespace-nowrap text-accent-3">[{children}]</span>
);

const H = ({ children }: { children: ReactNode }) => <div className="mt-3 text-accent-2"># {children}</div>;

// ---------------------------------------------------------------- intro

export function Neofetch() {
  const rows: [string, ReactNode][] = [
    ["Name", profile.name],
    ["Role", profile.title],
    ["OS", "RankinOS 12 (backend → GenAI)"],
    ["Host", profile.location],
    ["Uptime", `${profile.years} yrs engineering · ${profile.aiYears} yrs AI in prod`],
    ["Kernel", "LLMs · RAG · LangGraph · CUDA"],
    ["Shell", "python · typescript"],
    ["Last job", `${jobs[0].role} @ ${jobs[0].company}`],
    [
      "Status",
      profile.available ? (
        <span className="text-accent">● {profile.availability}</span>
      ) : (
        <span className="text-muted">○ not looking right now</span>
      ),
    ],
  ];
  return (
    <div className="flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-center">
      <pre className="ascii glow shrink-0 text-accent" aria-hidden>
        {CHIP}
      </pre>
      <div className="min-w-0">
        <div>
          <span className="font-bold text-accent">guest</span>
          <span className="text-muted">@</span>
          <span className="font-bold text-accent">{profile.host}</span>
        </div>
        <div className="text-muted">{"-".repeat(12 + profile.host.length)}</div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="w-20 shrink-0 font-bold text-accent-2">{k}</span>
            <span className="min-w-0">{v}</span>
          </div>
        ))}
        <div className="mt-2 flex gap-0" aria-hidden>
          {["bg-term", "bg-danger", "bg-accent", "bg-accent-3", "bg-accent-2", "bg-muted", "bg-fg"].map((c) => (
            <span key={c} className={`inline-block h-3.5 w-7 ${c}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Welcome() {
  return (
    <div className="mt-3">
      Welcome to <span className="text-accent">{profile.name}</span>&apos;s portfolio. Type{" "}
      <Run cmd="help" className="text-accent" /> to see commands, or start with{" "}
      <Run cmd="whoami" className="text-accent" />, <Run cmd="projects" className="text-accent" /> or{" "}
      <Run cmd="experience" className="text-accent" />.
      <div className="text-muted">
        Not a terminal person? <Run cmd="gui">switch to the GUI view</Run>.
      </div>
    </div>
  );
}

export function Banner() {
  return (
    <pre className="ascii glow text-accent" aria-label={profile.name}>
      {blockText("Robert") + "\n" + blockText("Rankin")}
    </pre>
  );
}

// ---------------------------------------------------------------- help

export type HelpRow = { name: string; usage?: string; summary: string; group: string };

export function Help({ rows }: { rows: HelpRow[] }) {
  const groups = ["explore", "system"];
  return (
    <div>
      {groups.map((g) => (
        <div key={g} className="mb-2">
          <div className="text-accent-2">{g === "explore" ? "# get to know me" : "# terminal"}</div>
          {rows
            .filter((r) => r.group === g)
            .map((r) => (
              <div key={r.name} className="flex flex-col sm:flex-row sm:gap-2">
                <span className="shrink-0 sm:w-44">
                  <Run cmd={r.name} className="text-accent">
                    {r.name}
                  </Run>
                  {r.usage && <span className="text-muted"> {r.usage}</span>}
                </span>
                <span className="pl-4 text-fg/80 sm:pl-0">{r.summary}</span>
              </div>
            ))}
        </div>
      ))}
      <div className="text-muted">
        Tab completes · ↑/↓ history · Ctrl+L clears · there are a few easter eggs, and <span className="text-accent-3">sudo</span>{" "}
        is one way in.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- files

export function About() {
  return (
    <div className="max-w-3xl space-y-2">
      <div>
        <span className="font-bold text-accent">{profile.name}</span> · {profile.title} · {profile.location}
      </div>
      {profile.summary.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <div className="text-muted">
        next → <Run cmd="projects" /> · <Run cmd="experience" /> · <Run cmd="skills" /> · <Run cmd="contact" />
      </div>
    </div>
  );
}

export function ProjectList() {
  return (
    <div>
      <div className="text-muted">total {projects.length} · click a file or run cat ~/projects/&lt;name&gt;.md</div>
      {projects.map((p) => (
        <div key={p.slug} className="grid grid-cols-1 py-0.5 sm:grid-cols-[minmax(0,17rem)_6.5rem_minmax(0,1fr)] sm:gap-3">
          <span className="truncate">
            <Run cmd={`cat ~/projects/${p.slug}.md`} className="text-accent-2">
              {p.slug}.md
            </Run>
          </span>
          <span className="hidden text-accent sm:block">{p.metric ? p.metric.value : <span className="text-muted">—</span>}</span>
          <span className="pl-4 text-fg/80 sm:pl-0">
            {p.metric && <span className="text-accent sm:hidden">{p.metric.value} · </span>}
            {p.tagline}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProjectView({ slug }: { slug: string }) {
  const index = projects.findIndex((p) => p.slug === slug);
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  return (
    <div className="max-w-3xl">
      <div className="text-lg font-bold text-accent glow"># {p.title}</div>
      <div className="text-muted">
        {p.org} · {p.period}
      </div>
      {p.metric && (
        <div className="mt-2 inline-flex items-baseline gap-3 border border-accent/40 bg-accent/10 px-3 py-1">
          <span className="text-2xl font-bold text-accent glow">{p.metric.value}</span>
          <span>{p.metric.label}</span>
        </div>
      )}
      <p className="mt-2 italic">{p.tagline}</p>
      <H>problem</H>
      <p>{p.problem}</p>
      <H>what I built</H>
      <ul>
        {p.built.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent">-</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <H>impact</H>
      <ul>
        {p.impact.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent">+</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <H>stack</H>
      <div>
        {p.stack.map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </div>
      {p.links && p.links.length > 0 && (
        <>
          <H>links</H>
          <div className="flex flex-wrap gap-4">
            {p.links.map((l) => (
              <Ext key={l.href} href={l.href}>
                {l.label}
              </Ext>
            ))}
          </div>
        </>
      )}
      <div className="mt-3 text-muted">
        ← <Run cmd="projects">all projects</Run> · next →{" "}
        <Run cmd={`cat ~/projects/${next.slug}.md`}>{next.slug}.md</Run>
      </div>
    </div>
  );
}

export function ExperienceLog() {
  return (
    <div className="max-w-3xl">
      {jobs.map((j, i) => (
        <div key={j.slug} className="relative border-l border-accent/50 pb-3 pl-5 last:border-transparent">
          <span className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full bg-accent glow-box" aria-hidden />
          <div>
            <span className="text-accent-3">commit {shortHash(j.slug)}</span>
            {i === 0 && <span className="text-accent-2"> (HEAD → career)</span>}
          </div>
          <div className="font-bold">
            {j.role} <span className="text-muted">@</span> <span className="text-accent">{j.company}</span>
          </div>
          <div className="text-muted">
            {j.start} – {j.end} · {j.location}
          </div>
          <div className="mt-0.5 text-fg/80">{j.highlights[0]}</div>
          <Run cmd={`cat ~/experience/${j.slug}.log`} className="text-accent-2">
            git show {shortHash(j.slug)}
          </Run>
        </div>
      ))}
      <div className="text-muted">
        <span className="text-accent-3">commit 0000000</span> (initial commit) · {education.degree}, {education.school} (
        {education.period})
      </div>
    </div>
  );
}

export function JobView({ slug }: { slug: string }) {
  const j = jobs.find((x) => x.slug === slug)!;
  return (
    <div className="max-w-3xl">
      <div className="text-accent-3">commit {shortHash(j.slug)}</div>
      <div>
        <span className="text-muted">Author: </span>
        {profile.name}
      </div>
      <div>
        <span className="text-muted">Date:   </span>
        {j.start} – {j.end}
      </div>
      <div>
        <span className="text-muted">Role:   </span>
        <span className="font-bold">{j.role}</span> @ <span className="text-accent">{j.company}</span> · {j.location}
      </div>
      {j.about && <p className="mt-2 pl-4 italic text-fg/80">{j.about}</p>}
      <ul className="mt-2">
        {j.highlights.map((h) => (
          <li key={h} className="flex gap-2 bg-accent/5">
            <span className="select-none text-accent">+</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        {j.tech.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <div className="mt-2 text-muted">
        ← <Run cmd="experience">git log</Run>
      </div>
    </div>
  );
}

export function SkillsJson() {
  return (
    <div className="max-w-4xl">
      <div className="text-muted">{"{"}</div>
      {skills.map((g, gi) => (
        <div key={g.key} className="pl-4">
          <span className="text-accent-2">&quot;{g.key}&quot;</span>
          <span className="text-muted">: [</span>
          <div className="pl-4">
            {g.items.map((item, i) => (
              <span key={item} className="inline-block whitespace-nowrap">
                <span className="text-accent-3">&quot;{item}&quot;</span>
                {i < g.items.length - 1 && <span className="mr-2 text-muted">,</span>}
              </span>
            ))}
          </div>
          <span className="text-muted">]{gi < skills.length - 1 ? "," : ""}</span>
        </div>
      ))}
      <div className="text-muted">{"}"}</div>
    </div>
  );
}

export function Contact() {
  const rows: [string, ReactNode][] = [
    ["email", <Ext key="e" href={`mailto:${profile.email}`}>{profile.email}</Ext>],
    ["linkedin", <Ext key="l" href={profile.linkedin}>{profile.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</Ext>],
    ...profile.extraLinks.map((l): [string, ReactNode] => [
      l.label.toLowerCase(),
      <Ext key={l.href} href={l.href}>
        {l.href.replace(/^https?:\/\/(www\.)?/, "")}
      </Ext>,
    ]),
    ["location", profile.location],
  ];
  return (
    <div>
      <div className="text-accent-2"># contact.md</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col sm:flex-row sm:gap-2">
          <span className="w-24 shrink-0 text-muted">{k}</span>
          <span className="min-w-0 break-all pl-4 sm:pl-0">{v}</span>
        </div>
      ))}
      {profile.available && <div className="mt-2 text-accent">● {profile.availability}. Let&apos;s talk.</div>}
    </div>
  );
}

export function Education() {
  return (
    <div>
      <span className="font-bold">{education.degree}</span> · <span className="text-accent">{education.school}</span>{" "}
      <span className="text-muted">({education.period})</span>
    </div>
  );
}

export function Resume() {
  if (!profile.resumeUrl) {
    return (
      <div>
        The PDF isn&apos;t published here, but you&apos;re in the right place: <Run cmd="whoami" />,{" "}
        <Run cmd="experience" />, <Run cmd="skills" />. For the PDF, <Run cmd="contact">get in touch</Run>.
      </div>
    );
  }
  return (
    <div>
      Opening <Ext href={profile.resumeUrl}>{profile.resumeUrl}</Ext> in a new tab…
    </div>
  );
}

export function renderFile(view: FileView): ReactNode {
  switch (view.kind) {
    case "about":
      return <About />;
    case "contact":
      return <Contact />;
    case "skills":
      return <SkillsJson />;
    case "education":
      return <Education />;
    case "resume":
      return <Resume />;
    case "project":
      return <ProjectView slug={view.slug} />;
    case "job":
      return <JobView slug={view.slug} />;
  }
}

export function Listing({ path, node }: { path: string; node: Extract<FsNode, { type: "dir" }> }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-0.5">
      {node.children.map((c) => {
        const full = join(path, c.name);
        return c.type === "dir" ? (
          <Run key={c.name} cmd={`ls ${full}`} className="font-bold text-accent-2">
            {c.name}/
          </Run>
        ) : (
          <Run key={c.name} cmd={`cat ${full}`}>
            {c.name}
          </Run>
        );
      })}
    </div>
  );
}

export function Tree({ node }: { node: Extract<FsNode, { type: "dir" }> }) {
  const lines: ReactNode[] = [];
  const walk = (dir: Extract<FsNode, { type: "dir" }>, path: string, prefix: string) => {
    dir.children.forEach((c, i) => {
      const last = i === dir.children.length - 1;
      const full = join(path, c.name);
      lines.push(
        <div key={full} className="whitespace-pre">
          <span className="text-muted">
            {prefix}
            {last ? "└── " : "├── "}
          </span>
          {c.type === "dir" ? (
            <Run cmd={`ls ${full}`} className="font-bold text-accent-2">
              {c.name}/
            </Run>
          ) : (
            <Run cmd={`cat ${full}`}>{c.name}</Run>
          )}
        </div>,
      );
      if (c.type === "dir") walk(c, full, prefix + (last ? "    " : "│   "));
    });
  };
  walk(node, "~", "");
  const dirs = node.children.filter((c) => c.type === "dir");
  const files = dirs.reduce((n, d) => n + (d.type === "dir" ? d.children.length : 0), node.children.length - dirs.length);
  return (
    <div className="overflow-x-auto">
      <div className="font-bold text-accent-2">~</div>
      {lines}
      <div className="mt-1 text-muted">
        {dirs.length} directories, {files} files
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- fun

export function HireMe() {
  return (
    <div className="max-w-2xl">
      <div className="text-muted">[sudo] password for guest: ********</div>
      <div className="text-accent">Access granted.</div>
      <div className="my-2 border border-dashed border-accent p-3">
        <div className="text-lg font-bold text-accent glow">Excellent decision.</div>
        <div>
          {profile.firstName} is {profile.available ? "open to new roles" : "always happy to chat"}, and the fastest way in is a
          direct message.
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          <span>
            → <Ext href={`mailto:${profile.email}?subject=Let's%20talk`}>email {profile.firstName}</Ext>
          </span>
          <span>
            → <Ext href={profile.linkedin}>connect on LinkedIn</Ext>
          </span>
        </div>
      </div>
    </div>
  );
}

export function Cowsay({ text }: { text: string }) {
  const msg = text.trim() || "Moo. Hire Robert.";
  const bar = "_".repeat(msg.length + 2);
  const cow = [`  ${bar}`, `< ${msg} >`, `  ${"-".repeat(msg.length + 2)}`, "         \\   ^__^", "          \\  (oo)\\_______", "             (__)\\       )\\/\\", "                 ||----w |", "                 ||     ||"];
  return <pre className="overflow-x-auto whitespace-pre">{cow.join("\n")}</pre>;
}
