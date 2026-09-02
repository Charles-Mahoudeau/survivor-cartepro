#!/usr/bin/env bun
import chalk from 'chalk';
import { getMigrations } from 'better-auth/db/migration';
import { authOptions } from '../src/config/auth/auth';
import { describeConnection, fail } from './db-common';

/**
 * Prints the SQL the authentication schema is missing, without running it.
 *
 * The counterpart of `db:show`: the auth migrator keeps no ledger table, so
 * "what is pending" is answered by diffing the configuration against the live
 * database, and this is the only way to read that diff before it is applied.
 */
console.log(chalk.gray(`Database: ${describeConnection()}`));
console.log('');

try {
  const { toBeCreated, toBeAdded, unsafeChanges, compileMigrations } =
    await getMigrations(authOptions, { throwOnUnsafe: false });

  if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    console.log(chalk.bold.green("Schéma d'authentification à jour."));
    console.log('');
    process.exit(0);
  }

  for (const change of unsafeChanges) {
    console.log(chalk.yellow(`Non applicable : ${change}`));
  }

  console.log(chalk.white(await compileMigrations()));
  console.log('');
} catch (error) {
  await fail(
    null,
    "Erreur lors de la lecture du schéma d'authentification.",
    error,
  );
}
