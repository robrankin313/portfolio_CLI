"use client";

import { useMode } from "@/lib/prefs";
import GuiView from "./GuiView";
import Terminal from "./terminal/Terminal";

// Both views stay mounted so terminal history survives a trip to the GUI,
// and the GUI's full content is in the static HTML for search engines.
export default function Portfolio() {
  const mode = useMode();
  return (
    <>
      <Terminal active={mode === "terminal"} />
      <GuiView active={mode === "gui"} />
    </>
  );
}
