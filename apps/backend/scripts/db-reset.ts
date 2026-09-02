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

console.log(chalk.bold.green('Base réinitialisée!'));
console.log('');
