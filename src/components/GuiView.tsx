"use client";

import type { ReactNode } from "react";
import { education, jobs, profile, projects, skills } from "@/data/profile";
import { setMode, setPrefs, THEMES, usePrefs } from "@/lib/prefs";

const SECTIONS = ["about", "projects", "experience", "skills", "contact"];

function SectionHead({ cmd, title }: { cmd: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="font-mono text-sm text-accent">$ {cmd}</div>
      <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded border border-line bg-panel px-2 py-0.5 font-mono text-xs text-fg/80">{children}</span>;
}

function Button({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 font-mono text-sm font-bold transition-all ${
        primary
          ? "bg-accent text-term hover:shadow-[0_0_24px_var(--glow)]"
          : "border border-line text-fg hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </a>
  );
}

export default function GuiView({ active }: { active: boolean }) {
  const { theme } = usePrefs();
  const cycleTheme = () => {
    const i = THEMES.findIndex((t) => t.name === theme);
    setPrefs({ theme: THEMES[(i + 1) % THEMES.length].name });
  };

  return (
    <div hidden={!active} className="gui min-h-dvh bg-page font-sans text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-page/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 font-mono text-sm">
          <a href="#about" className="font-bold">
            <span className="text-accent">~/</span>
            {profile.host}
          </a>
          <nav className="hidden flex-1 justify-center gap-6 text-fg/70 md:flex">
            {SECTIONS.map((s) => (
              <a key={s} href={`#${s}`} className="hover:text-accent">
                {s}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button
              type="button"
              onClick={cycleTheme}
              className="cursor-pointer rounded border border-line px-2 py-1 text-xs text-fg/70 hover:border-accent hover:text-accent"
              title="Cycle theme"
            >
              theme: {theme}
            </button>
            <button
              type="button"
              onClick={() => setMode("terminal")}
              className="cursor-pointer rounded bg-accent px-2 py-1 text-xs font-bold text-term"
            >
              &gt;_ terminal
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        {/* hero */}
        <section id="about" className="scroll-mt-16 pt-16 pb-20 sm:pt-24">
          <div className="font-mono text-sm text-accent">$ whoami</div>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">
            {profile.name}
            <span className="cursor cursor-on ml-2 inline-block w-[0.5em] align-baseline">&nbsp;</span>
          </h1>
          <div className="mt-3 font-mono text-lg text-accent-2 sm:text-xl">{profile.title}</div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg/85 sm:text-xl">{profile.tagline}</p>
          {profile.available && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-sm text-accent">
              <span className="pulse-dot h-2 w-2 rounded-full bg-accent" />
              {profile.availability}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`mailto:${profile.email}`} primary>
              Email me →
            </Button>
            <Button href={profile.linkedin}>LinkedIn ↗</Button>
            <Button href="#projects">View projects</Button>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-5">
            {profile.stats.map((s) => (
              <div key={s.label} className="bg-term p-4">
                <div className="font-mono text-2xl font-bold text-accent sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-sm text-fg/70">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-6 text-fg/85 sm:grid-cols-2">
            {profile.summary.map((p) => (
              <p key={p} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* projects */}
        <section id="projects" className="scroll-mt-16 py-16">
          <SectionHead cmd="ls ~/projects" title="Selected work" />
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <article
                key={p.slug}
                className="group flex flex-col rounded-lg border border-line bg-term p-5 transition-colors hover:border-accent/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-mono text-xs text-fg/60">
                    {p.org} · {p.period}
                  </div>
                  {p.metric && (
                    <div className="text-right">
                      <div className="font-mono text-2xl leading-none font-bold text-accent">{p.metric.value}</div>
                      <div className="mt-1 text-xs text-fg/60">{p.metric.label}</div>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-xl font-bold group-hover:text-accent">{p.title}</h3>
                <p className="mt-2 text-fg/80">{p.tagline}</p>
                <details className="mt-3 text-sm text-fg/80">
                  <summary className="cursor-pointer font-mono text-xs text-accent-2 select-none hover:text-accent">
                    cat {p.slug}.md
                  </summary>
                  <p className="mt-3">{p.problem}</p>
                  <ul className="mt-3 space-y-1">
                    {[...p.built, ...p.impact].map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="font-mono text-accent">›</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {p.stack.map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* experience */}
        <section id="experience" className="scroll-mt-16 py-16">
          <SectionHead cmd="git log --career" title="Experience" />
          <ol className="relative border-l border-line">
            {jobs.map((j, i) => (
              <li key={j.slug} className="relative pb-10 pl-6 last:pb-0">
                <span
                  className={`absolute top-2 -left-[5px] h-[9px] w-[9px] rounded-full ${i === 0 ? "bg-accent glow-box" : "bg-line"}`}
                />
                <div className="font-mono text-xs text-fg/60">
                  {j.start} – {j.end} · {j.location}
                </div>
                <h3 className="mt-1 text-lg font-bold">
                  {j.role} <span className="text-fg/50">@</span> <span className="text-accent">{j.company}</span>
                </h3>
                {j.about && <p className="text-sm text-fg/60">{j.about}</p>}
                <ul className="mt-3 space-y-1.5 text-fg/85">
                  {j.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="font-mono text-accent">+</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.tech.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-lg border border-line bg-term p-5">
            <div className="font-mono text-xs text-fg/60">{education.period}</div>
            <div className="mt-1 font-bold">
              {education.degree} · <span className="text-accent">{education.school}</span>
            </div>
          </div>
        </section>

        {/* skills */}
        <section id="skills" className="scroll-mt-16 py-16">
          <SectionHead cmd="cat skills.json" title="Toolbox" />
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((g) => (
              <div key={g.key} className="rounded-lg border border-line bg-term p-5">
                <div className="font-mono text-sm text-accent-2">&quot;{g.key}&quot;</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="scroll-mt-16 py-20">
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-8 sm:p-12">
            <div className="font-mono text-sm text-accent">$ sudo hire-me</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Let&apos;s build something.</h2>
            <p className="mt-4 max-w-xl text-lg text-fg/80">
              {profile.available
                ? `${profile.availability}. The fastest way to reach me is email.`
                : "Always happy to talk about LLM systems, inference and evals."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`mailto:${profile.email}`} primary>
                {profile.email}
              </Button>
              <Button href={profile.linkedin}>LinkedIn ↗</Button>
              {profile.extraLinks.map((l) => (
                <Button key={l.href} href={l.href}>
                  {l.label} ↗
                </Button>
              ))}
            </div>
            <div className="mt-6 font-mono text-sm text-fg/60">{profile.location}</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 font-mono text-xs text-fg/50">
          <span>
            © {profile.name} · built as a terminal, because why not
          </span>
          <button type="button" onClick={() => setMode("terminal")} className="cursor-pointer hover:text-accent">
            prefer the terminal? &gt;_
          </button>
        </div>
      </footer>
    </div>
  );
}
