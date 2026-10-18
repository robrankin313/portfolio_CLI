import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `npm run build` writes plain HTML/CSS/JS to ./out,
  // which can be hosted anywhere (Vercel, Netlify, GitHub Pages, S3...).
  output: "export",
  images: { unoptimized: true },
  // Dev server only: let phones/laptops on the home network (192.168.x.x)
  // use live reload. Has no effect on the static build.
  allowedDevOrigins: ["192.168.*.*"],
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
