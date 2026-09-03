// A JS config, for one reason only: a command written as a string receives the
// staged file list as arguments, whereas a function decides what it runs.
//
// The root ESLint 10 cannot load the eslint-plugin-react that eslint-config-next
// pulls in, so web files go through the package's own ESLint 9, called on the
// whole application rather than on the staged files. CI does the same, and the
// app is small enough that the difference does not show.
const webLint = () => 'bun --filter=@tickettout/frontend run lint:check';

export default {
  'apps/backend/{src,scripts,test}/**/*.ts': ['prettier --check', 'eslint'],
  'apps/frontend/**/*.{ts,tsx}': ['prettier --check', webLint],
  'apps/frontend/**/*.css': ['prettier --check'],
  '*.{json,md,yml,yaml,mjs}': ['prettier --check'],
};
