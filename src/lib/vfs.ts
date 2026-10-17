import { jobs, profile, projects } from "@/data/profile";

// A tiny read-only filesystem so `ls`, `cd`, `cat` and `tree` feel real.

export type FileView =
  | { kind: "about" }
  | { kind: "contact" }
  | { kind: "skills" }
  | { kind: "education" }
  | { kind: "resume" }
  | { kind: "project"; slug: string }
  | { kind: "job"; slug: string };

export type FsNode =
  | { type: "dir"; name: string; children: FsNode[] }
  | { type: "file"; name: string; view: FileView };

const file = (name: string, view: FileView): FsNode => ({ type: "file", name, view });

export const root: FsNode = {
  type: "dir",
  name: "~",
  children: [
    file("about.txt", { kind: "about" }),
    file("contact.md", { kind: "contact" }),
    file("education.txt", { kind: "education" }),
    {
      type: "dir",
      name: "experience",
      children: jobs.map((j) => file(`${j.slug}.log`, { kind: "job", slug: j.slug })),
    },
    {
      type: "dir",
      name: "projects",
      children: projects.map((p) => file(`${p.slug}.md`, { kind: "project", slug: p.slug })),
    },
    ...(profile.resumeUrl ? [file("resume.pdf", { kind: "resume" })] : []),
    file("skills.json", { kind: "skills" }),
  ],
};

/** Resolve `input` against `cwd` into an absolute path like "~/projects/x.md". */
export function resolvePath(cwd: string, input: string): string {
  const absolute = input.startsWith("~") || input.startsWith("/");
  const segments = absolute ? [] : splitPath(cwd);
  for (const part of input.replace(/^~/, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") segments.pop();
    else segments.push(part);
  }
  return ["~", ...segments].join("/");
}

function splitPath(path: string): string[] {
  return path.replace(/^~/, "").split("/").filter(Boolean);
}

export function lookup(path: string): FsNode | null {
  let node: FsNode = root;
  for (const segment of splitPath(path)) {
    if (node.type !== "dir") return null;
    const next: FsNode | undefined = node.children.find((c) => c.name === segment);
    if (!next) return null;
    node = next;
  }
  return node;
}

export const join = (dir: string, name: string) => (dir === "~" ? `~/${name}` : `${dir}/${name}`);

/** Path completions for a partial argument. Directories get a trailing slash. */
export function completePath(cwd: string, partial: string, filter?: (n: FsNode) => boolean): string[] {
  const slash = partial.lastIndexOf("/");
  const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : "";
  const base = slash >= 0 ? partial.slice(slash + 1) : partial;
  const dir = lookup(resolvePath(cwd, dirPart || "."));
  if (!dir || dir.type !== "dir") return [];
  return dir.children
    .filter((c) => c.name.startsWith(base) && (!filter || filter(c)))
    .map((c) => dirPart + c.name + (c.type === "dir" ? "/" : ""));
}
