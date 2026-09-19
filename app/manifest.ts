import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hanzi100 — Learn Mandarin",
    short_name: "Hanzi100",
    description:
      "Your first 100 Mandarin words, one handwritten character at a time.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8f2",
    theme_color: "#284b40",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
