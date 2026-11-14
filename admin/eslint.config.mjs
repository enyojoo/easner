import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

/** Design-system rules from guides/25-office.md: tokens only. No hex, no gray-*, no font-bold. */
const tokensOnly = [
  "error",
  {
    selector: "Literal[value=/#[0-9a-fA-F]{6}\\b/]",
    message: "Use a design-system token instead of hex. See app/design-tokens.css.",
  },
  {
    selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{6}\\b/]",
    message: "Use a design-system token instead of hex. See app/design-tokens.css.",
  },
  {
    selector: "Literal[value=/\\b(text|bg|border|ring|fill|stroke)-(gray|slate|zinc|neutral|stone)-\\d/]",
    message: "Use a semantic token (muted-foreground, border, …) instead of a gray-* scale.",
  },
  {
    selector: "Literal[value=/\\bfont-bold\\b/]",
    message: "Office titles are semibold. Use font-semibold.",
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
    files: ["components/**/*.tsx", "app/**/*.tsx", "lib/**/*.ts", "lib/**/*.tsx"],
    rules: { "no-restricted-syntax": tokensOnly },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])

export default eslintConfig
