/** @type {import('prettier').Config} */

const config = {
  singleQuote: true,
  jsxSingleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['generateClassName', 'twMerge', 'twJoin', 'clsx', 'cva'],
};

export default config;
