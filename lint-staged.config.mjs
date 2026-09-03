// the root ESLint 10 can't load the eslint-plugin-react
// that eslint-config-next pulls in,
// so web files go through the package's own ESLint 9,
// which a function lets us call without the staged file list
const webLint = () => 'bun --filter=@cartepro/frontend run lint:check';

export default {
  'apps/backend/{src,scripts}/**/*.ts': ['prettier --check', 'eslint'],
  'apps/frontend/{app,components,lib}/**/*.{ts,tsx}': [
    'prettier --check',
    webLint,
  ],
  'apps/frontend/{app,components,lib}/**/*.css': ['prettier --check'],
  '*.{json,md,yml,yaml,mjs}': ['prettier --check'],
};
