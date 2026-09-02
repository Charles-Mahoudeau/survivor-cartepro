// the root ESLint 10 can't load the eslint-plugin-react
// that eslint-config-next pulls in,
// so .lintstagedrc.json became lint-staged.config.mjs,
const webLint = () => 'bun --filter=@cartepro/frontend run lint:check';

export default {
  'apps/*/{src,scripts}/**/*.ts': ['prettier --check', 'eslint'],
  'apps/frontend/app/**/*.{ts,tsx}': ['prettier --check', webLint],
  'apps/frontend/app/**/*.css': ['prettier --check'],
  'scripts/**/*.ts': ['prettier --check'],
  '*.{json,md,yml,yaml,mjs}': ['prettier --check'],
};
