import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Listing imagery is supplied by sellers and can originate from any
      // permitted media host, so this storefront cannot safely hard-code the
      // remote host allow-list required by next/image.
      "@next/next/no-img-element": "off",
    },
  },
])
