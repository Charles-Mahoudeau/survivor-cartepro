import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { config } from 'dotenv';

/**
 * Collects every `.env` from the working directory up to the filesystem root.
 *
 * `dotenv/config` reads only the one beside the working directory, which here
 * is `apps/backend`, while compose reads the one at the repository root — so a
 * variable could be set in one place and read from the other.
 *
 * Nearest wins: dotenv keeps the first definition it sees for a key.
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
