#!/usr/bin/env bun
import chalk from 'chalk';
import dataSource from '../src/config/database/data-source';
import { connect, describeConnection, fail } from './db-common';

/**
 * Refuses to run against a production environment. This script drops every
 * table, and the one place that must never happen is the one holding validated
 * transactions.
 */
if (process.env.NODE_ENV === 'production') {
  console.log('');
  console.log(chalk.bold.red('db:drop est interdit en production.'));
  console.log(chalk.gray(`└─ Cible : ${describeConnection()}`));
  console.log('');
  process.exit(1);
}

console.log(chalk.yellow('Suppression de tout le schéma...'));
console.log(chalk.gray(`Database: ${describeConnection()}`));

try {
  await connect(dataSource);
  await dataSource.dropDatabase();
  await dataSource.destroy();

  console.log('');
  console.log(chalk.bold.green('Schéma supprimé!'));
  console.log('');
} catch (error) {
  await fail(dataSource, 'Erreur lors de la suppression du schéma.', error);
}
