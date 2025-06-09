import { defineConfig } from "eslint/config";
import { base, stylistic, typeAware, vitest } from "@saeris/eslint-config";

export default defineConfig([
  base,
  stylistic,
  typeAware,
  vitest,
  {
    rules: {
      "@stylistic/array-bracket-newline": `off`,
      "@stylistic/function-paren-newline": `off`,
      "@stylistic/indent": `off`,
      "@stylistic/indent-binary-ops": `off`,
      "@stylistic/max-len": `off`,
      "@stylistic/no-mixed-operators": `off`,
      "@stylistic/operator-linebreak": `off`,
      "@typescript-eslint/max-params": `off`,
      "@typescript-eslint/prefer-destructuring": `off`,
      "vitest/prefer-to-be-falsy": `off`,
      "vitest/prefer-to-be-truthy": `off`,
      "vitest/require-to-throw-message": `off`,
      "import-x/no-useless-path-segments": [`error`, { noUselessIndex: false }]
    }
  }
]);
