#!/usr/bin/env bun
import chalk from 'chalk';
import dataSource from '../src/config/database/data-source';
import { ROLES, type Role } from '../src/config/auth/auth.constants';
import { User } from '../src/modules/user/entities';
import { connect, describeConnection, fail } from './db-common';

/**
 * Grants a role to an existing account, by email.
 *
 * Every route the admin plugin exposes already requires an administrator, so
 * without an out-of-band step there is no way for the first one to exist. This
 * is that step, and it is deliberately a script rather than an endpoint: an
 * HTTP route that hands out the admin role is a route someone eventually calls.
 *
 * It writes through the `User` entity, since the table is ours — no raw SQL,
 * and the column name comes from the same place the migration does.
 */
const [email, requestedRole = ROLES.ADMIN] = process.argv.slice(2);

if (!email) {
  console.log('');
  console.log(chalk.bold.red('Usage : bun run auth:promote <email> [rôle]'));
  console.log(
    chalk.gray('└─ Rôles : ') + chalk.white(Object.values(ROLES).join(', ')),
  );
  console.log('');
  process.exit(1);
}

if (!Object.values(ROLES).includes(requestedRole as Role)) {
  console.log('');
  console.log(chalk.bold.red(`Rôle inconnu : ${requestedRole}`));
  console.log(
    chalk.gray('└─ Rôles : ') + chalk.white(Object.values(ROLES).join(', ')),
  );
  console.log('');
  process.exit(1);
}

console.log(chalk.gray(`Database: ${describeConnection()}`));

try {
  await connect(dataSource);
  const users = dataSource.getRepository(User);
  const user = await users.findOne({ where: { email } });

  if (!user) {
    await dataSource.destroy();
    console.log('');
    console.log(chalk.bold.red(`Aucun compte pour ${email}.`));
    console.log(
      chalk.gray('└─ ') +
        chalk.white('Le compte doit exister : la promotion ne crée personne.'),
    );
    console.log('');
    process.exit(1);
  }

  const previousRole = user.role ?? ROLES.USER;
  await users.update({ id: user.id }, { role: requestedRole });
  await dataSource.destroy();

  console.log('');
  console.log(chalk.bold.green('Rôle mis à jour!'));
  console.log(chalk.gray('├─ Compte : ') + chalk.white(email));
  console.log(
    chalk.gray('└─ Rôle :   ') +
      chalk.white(`${previousRole} → ${requestedRole}`),
  );
  console.log('');
} catch (error) {
  await fail(dataSource, 'Erreur lors de la mise à jour du rôle.', error);
}
