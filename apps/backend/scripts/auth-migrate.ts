#!/usr/bin/env bun
import chalk from 'chalk';
import { getMigrations } from 'better-auth/db/migration';
import { authOptions } from '../src/config/auth/auth';
import { describeConnection, fail } from './db-common';

/**
 * Applies the pending Better Auth schema without starting the API.
 *
 * The application does the same at boot, so this script is not the normal way
 * onto the schema — it is what `db:reset` calls, and what a deployment runs
 * when it wants the schema in place before the first request.
 */
const startTime = performance.now();

console.log(chalk.gray("Exécution des migrations d'authentification..."));
console.log(chalk.gray(`Database: ${describeConnection()}`));

try {
  const { toBeCreated, toBeAdded, runMigrations } =
    await getMigrations(authOptions);

  const duration = () => (performance.now() - startTime).toFixed(2);

  if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    console.log('');
    console.log(chalk.bold.green('Aucune migration en attente, base à jour!'));
    console.log(chalk.gray('├─ Time:     ') + chalk.white(`${duration()}ms`));
    console.log(
      chalk.gray('└─ Database: ') + chalk.white(describeConnection()),
    );
    console.log('');
    process.exit(0);
  }

  await runMigrations();

  console.log('');
  console.log(chalk.bold.green("Schéma d'authentification appliqué!"));
  for (const { table } of toBeCreated) {
    console.log(chalk.gray('├─ ') + chalk.white(`table créée : ${table}`));
  }
  for (const { table } of toBeAdded) {
    console.log(
      chalk.gray('├─ ') + chalk.white(`colonnes ajoutées : ${table}`),
    );
  }
  console.log(chalk.gray('├─ Time:     ') + chalk.white(`${duration()}ms`));
  console.log(chalk.gray('└─ Database: ') + chalk.white(describeConnection()));
  console.log('');
} catch (error) {
  await fail(
    null,
    "Erreur lors de l'exécution des migrations d'authentification.",
    error,
  );
}
