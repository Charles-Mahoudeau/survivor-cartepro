#!/usr/bin/env bun
import chalk from 'chalk';
import dataSource from '../src/config/database/data-source';
import {
  ensureApplicationRoleExists,
  grantApplicationRolePrivileges,
} from '../src/config/database/ensure-application-role';
import { connect, describeConnection, fail } from './db-common';

const startTime = performance.now();

console.log(chalk.gray('Exécution des migrations TypeORM...'));
console.log(chalk.gray(`Database: ${describeConnection()}`));

try {
  await connect(dataSource);
  // Before: a migration's own DCL (audit_log's REVOKE) targets this role by
  // name, so it has to exist before migrations run, not only once they do.
  await ensureApplicationRoleExists(dataSource);
  const executed = await dataSource.runMigrations({ transaction: 'all' });
  // After: covers whatever tables migrations just created. Runs every time,
  // not only when a migration just applied, so the restricted role's grants
  // stay in sync even on a re-run that finds nothing pending.
  await grantApplicationRolePrivileges(dataSource);
  await dataSource.destroy();

  const duration = (performance.now() - startTime).toFixed(2);
  const plural = executed.length > 1 ? 's' : '';

  console.log('');
  if (executed.length === 0) {
    console.log(chalk.bold.green('Aucune migration en attente, base à jour!'));
  } else {
    console.log(
      chalk.bold.green(
        `${executed.length} migration${plural} appliquée${plural} avec succès!`,
      ),
    );
    for (const migration of executed) {
      console.log(chalk.gray('├─ ') + chalk.white(migration.name));
    }
  }
  console.log(chalk.gray('├─ Time:     ') + chalk.white(`${duration}ms`));
  console.log(chalk.gray('└─ Database: ') + chalk.white(describeConnection()));
  console.log('');
} catch (error) {
  await fail(dataSource, "Erreur lors de l'exécution des migrations.", error);
}
