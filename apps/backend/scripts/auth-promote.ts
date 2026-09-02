#!/usr/bin/env bun
import chalk from 'chalk';
import { auth } from '../src/config/auth/auth';
import { ROLES, type Role } from '../src/config/auth/auth.constants';
import { describeConnection, fail } from './db-common';

/**
 * Grants a role to an existing account, by email.
 *
 * Every route the admin plugin exposes already requires an administrator, so
 * without an out-of-band step there is no way for the first one to exist. This
 * is that step, and it is deliberately a script rather than an endpoint: an
 * HTTP route that hands out the admin role is a route someone eventually calls.
 *
 * It goes through the library's own adapter rather than an UPDATE, so it stays
 * correct if the column moves.
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
  const context = await auth.$context;
  const found = await context.internalAdapter.findUserByEmail(email);

  if (!found?.user) {
    console.log('');
    console.log(chalk.bold.red(`Aucun compte pour ${email}.`));
    console.log(
      chalk.gray('└─ ') +
        chalk.white('Le compte doit exister : la promotion ne crée personne.'),
    );
    console.log('');
    process.exit(1);
  }

  // `role` is a column the admin plugin adds. The internal adapter is typed
  // against the core user, which does not know about it, so the read is
  // narrowed here rather than left to an assertion at the call site.
  const previousRole =
    (found.user as { role?: string | null }).role ?? ROLES.USER;
  await context.internalAdapter.updateUser(found.user.id, {
    role: requestedRole,
  });

  console.log('');
  console.log(chalk.bold.green('Rôle mis à jour!'));
  console.log(chalk.gray('├─ Compte : ') + chalk.white(email));
  console.log(
    chalk.gray('└─ Rôle :   ') +
      chalk.white(`${previousRole} → ${requestedRole}`),
  );
  console.log('');
  process.exit(0);
} catch (error) {
  await fail(null, 'Erreur lors de la mise à jour du rôle.', error);
}
