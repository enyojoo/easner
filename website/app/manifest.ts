import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Easner",
    short_name: "Easner",
    description: "Stablecoin-powered banking and payment infrastructure for global cross-border money movement.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F3EB",
    theme_color: "#0F1110",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
