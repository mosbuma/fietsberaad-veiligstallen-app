/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: "avoid",
  endOfLine: "lf",
};

module.exports = config;
