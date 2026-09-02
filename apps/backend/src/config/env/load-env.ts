import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { config } from 'dotenv';

/**
 * Loads `.env`, looking up from the working directory to the filesystem root.
 *
 * Importing `dotenv/config` reads a single `.env` next to the working
 * directory, which in this monorepo is `apps/backend`. The compose stack reads
 * the one at the repository root — so the same variable could be set in one
 * place and read from the other, and a `DATABASE_PORT` moved for the container
 * would silently not move for `bun run dev`.
 *
 * Nearest file wins: an app-local `.env` still overrides the root one, since
 * dotenv keeps the first definition it sees for a key.
 */
function envFilesFromHere(): string[] {
  const files: string[] = [];
  const { root } = parse(process.cwd());

  for (
    let directory = process.cwd();
    directory !== root;
    directory = dirname(directory)
  ) {
    const candidate = join(directory, '.env');
    if (existsSync(candidate)) {
      files.push(candidate);
    }
  }

  return files;
}

const files = envFilesFromHere();

if (files.length > 0) {
  config({ path: files, quiet: true });
}
