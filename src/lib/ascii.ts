// "ANSI Shadow" style block letters, composed at runtime so columns always line up.
const GLYPHS: Record<string, string[]> = {
  A: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  B: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██████╔╝", "╚═════╝ "],
  E: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  I: ["██╗", "██║", "██║", "██║", "██║", "╚═╝"],
  K: ["██╗  ██╗", "██║ ██╔╝", "█████╔╝ ", "██╔═██╗ ", "██║  ██╗", "╚═╝  ╚═╝"],
  N: ["███╗   ██╗", "████╗  ██║", "██╔██╗ ██║", "██║╚██╗██║", "██║ ╚████║", "╚═╝  ╚═══╝"],
  O: [" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  R: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
  T: ["████████╗", "╚══██╔══╝", "   ██║   ", "   ██║   ", "   ██║   ", "   ╚═╝   "],
  " ": ["   ", "   ", "   ", "   ", "   ", "   "],
};

export function blockText(text: string): string {
  const rows = Array.from({ length: 6 }, () => "");
  for (const ch of text.toUpperCase()) {
    const glyph = GLYPHS[ch] ?? GLYPHS[" "];
    glyph.forEach((line, i) => (rows[i] += line));
  }
  return rows.map((r) => r.trimEnd()).join("\n");
}

// An "AI" chip for the neofetch card.
export const CHIP = [
  "     │ │ │ │ │ │ │",
  "   ┌─┴─┴─┴─┴─┴─┴─┴─┐",
  " ──┤               ├──",
  " ──┤   ▄▀▀▄  ▀█▀   ├──",
  " ──┤   █▄▄█   █    ├──",
  " ──┤   █  █  ▄█▄   ├──",
  " ──┤               ├──",
  "   └─┬─┬─┬─┬─┬─┬─┬─┘",
  "     │ │ │ │ │ │ │",
].join("\n");

/** Short, stable fake commit hash for a string (used by the git-log style experience view). */
export function shortHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}
