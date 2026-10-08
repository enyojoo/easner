import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

/** Colours come from design-system tokens (app/design-tokens.css), never inline hex. */
const noHex = (level) => [
  level,
  {
    selector: "Literal[value=/#[0-9a-fA-F]{6}\\b/]",
    message: "Use a design-system token (web-*, brand-*, app-*) instead of hex. See app/design-tokens.css.",
  },
  {
    selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{6}\\b/]",
    message: "Use a design-system token (web-*, brand-*, app-*) instead of hex. See app/design-tokens.css.",
  },
]

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["components/**/*.tsx", "app/**/*.tsx", "lib/marketing/layout-constants.ts"],
    rules: { "no-restricted-syntax": noHex("error") },
  },
  {
    // Hex is required here: third-party embed config, QR rendering, brand-coloured store icons, OG images, demo partner colour.
    files: [
      "components/marketing/contact-booking.tsx",
      "components/marketing/download-qr.tsx",
      "components/marketing/store-icons.tsx",
      "components/marketing/screens/partner-showcase.tsx",
      "lib/marketing/og-image.tsx",
      "app/**/opengraph-image.tsx",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])

export default eslintConfig
