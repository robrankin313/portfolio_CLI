# Robert Rankin — terminal portfolio

A terminal-style portfolio (Next.js 16 + Tailwind 4) with a point-and-click GUI view, four themes, and a few easter eggs. It builds to a fully static site.

## Edit your content

Everything the site says lives in [`src/data/profile.ts`](src/data/profile.ts): bio, projects, experience, skills, links.

- **Add links** (GitHub, Hugging Face, blog…): `profile.extraLinks`
- **Publish your resume PDF**: put it in `public/` and set `profile.resumeUrl` (e.g. `"/Robert_Rankin.pdf"`). This enables `resume`, `open resume` and `resume.pdf` in the filesystem.
- **Project links** (repo, demo, paper): add `links: [{ label, href }]` to a project.
- **Availability badge**: `profile.available` / `profile.availability`

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static files are written to `out/`. Host them anywhere.

## Deploy

- **Vercel**: import the repo at vercel.com/new. No settings needed.
- **Netlify / Cloudflare Pages**: build command `npm run build`, output directory `out`.
- **GitHub Pages**: publish `out/`. If it's served from a sub-path (`username.github.io/repo`), set `basePath` in `next.config.ts`.

## Terminal commands

`help`, `whoami`, `projects`, `experience` (also `git log`), `skills`, `contact`, `resume`, `neofetch`, `ls`, `cd`, `cat`, `tree`, `open`, `theme`, `crt`, `history`, `clear`, `gui`. Tab completes, ↑/↓ walks history. Append `#gui` to the URL to link straight to the GUI view.

There are also some hidden commands.
