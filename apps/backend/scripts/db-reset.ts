#!/usr/bin/env bun
import { $ } from 'bun';
import chalk from 'chalk';
import { describeConnection } from './db-common';

if (process.env.NODE_ENV === 'production') {
  console.log('');
  console.log(chalk.bold.red('db:reset est interdit en production.'));
  console.log(chalk.gray(`└─ Cible : ${describeConnection()}`));
  console.log('');
  process.exit(1);
}

console.log(chalk.yellow('Réinitialisation complète de la base...'));
console.log('');

const drop = await $`bun scripts/db-drop.ts`.nothrow();
if (drop.exitCode !== 0) {
  process.exit(drop.exitCode);
}

const migrate = await $`bun scripts/db-migrate.ts`.nothrow();
if (migrate.exitCode !== 0) {
  process.exit(migrate.exitCode);
}

// `db:drop` takes the whole schema down, authentication tables included, and
// those are not TypeORM's to put back — a second migrator owns them.
const authMigrate = await $`bun scripts/auth-migrate.ts`.nothrow();
if (authMigrate.exitCode !== 0) {
  process.exit(authMigrate.exitCode);
}

console.log(chalk.bold.green('Base réinitialisée!'));
console.log('');
