#!/usr/bin/env bun
import chalk from 'chalk';
import dataSource from '../src/config/database/data-source';
import { connect, describeConnection, fail } from './db-common';

console.log(chalk.gray(`Database: ${describeConnection()}`));
console.log('');

try {
  await connect(dataSource);
  await dataSource.showMigrations();
  await dataSource.destroy();
} catch (error) {
  await fail(dataSource, 'Erreur lors de la lecture des migrations.', error);
}
