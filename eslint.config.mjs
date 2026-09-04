import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
  {
    rules: {
      // Project uses <img> intentionally for dynamic supabase URLs + CMS images
      // where next/image width/height is not known at build time; we handle
      // lazy-loading, decoding, and responsive sizing via CSS + loading="lazy".
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;