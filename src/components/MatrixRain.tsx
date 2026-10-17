"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789<>/{}$#RANKIN";
const SIZE = 16;

export default function MatrixRain({ onExit }: { onExit: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#3dff8f";

    let drops: number[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / SIZE) }, () => Math.random() * -40);
    };
    resize();

    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 45) return;
      last = t;
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `${SIZE}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * SIZE, y * SIZE);
        drops[i] = y * SIZE > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    raf = requestAnimationFrame(draw);

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onExit();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("resize", resize);
    const timeout = setTimeout(onExit, 20_000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("resize", resize);
    };
  }, [onExit]);

  return <canvas ref={ref} onClick={onExit} className="fixed inset-0 z-50 cursor-pointer bg-black" aria-hidden />;
}
