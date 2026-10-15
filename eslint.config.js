const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/**", "example/**", ".IGNORE/**", ".expo/**", "expo-test/**"] },
  { files: ["scripts/**/*.cjs"], languageOptions: { globals: { __dirname: "readonly" } } },
]);
