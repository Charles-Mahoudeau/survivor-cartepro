#!/usr/bin/env bun
import chalk from 'chalk';
import dataSource from '../src/config/database/data-source';
import { connect, describeConnection, fail } from './db-common';

console.log(chalk.gray('Annulation de la dernière migration...'));
console.log(chalk.gray(`Database: ${describeConnection()}`));

try {
  await connect(dataSource);
  await dataSource.undoLastMigration({ transaction: 'all' });
  await dataSource.destroy();

  console.log('');
  console.log(chalk.bold.green('Dernière migration annulée!'));
  console.log('');
} catch (error) {
  await fail(dataSource, "Erreur lors de l'annulation.", error);
}
