#!/usr/bin/env bun
import { $ } from 'bun';
import chalk from 'chalk';

const name = process.argv[2];

if (!name) {
  console.log('');
  console.log(chalk.bold.red('Nom de migration manquant.'));
  console.log(
    chalk.gray('├─ Usage :   ') + chalk.white('bun run db:generate <Nom>'),
  );
  console.log(
    chalk.gray('└─ Exemple : ') + chalk.white('bun run db:generate AddPartner'),
  );
  console.log('');
  process.exit(1);
}

const outPath = `database/migrations/${name}`;
const startTime = performance.now();

console.log(
  chalk.gray('Génération de la migration depuis le diff des entities...'),
);
console.log(chalk.gray(`├─ Nom :    ${name}`));
console.log(chalk.gray(`└─ Sortie : ${outPath}`));
console.log('');

try {
  const result =
    await $`bunx --bun typeorm -d src/config/database/data-source.ts migration:generate ${outPath}`;
  if (result.exitCode !== 0) {
    throw new Error(
      `typeorm migration:generate a échoué (exit ${result.exitCode})`,
    );
  }
} catch (error) {
  console.log('');
  console.log(chalk.bold.red('Erreur lors de la génération de la migration.'));
  console.log(
    chalk.red(`└─ ${error instanceof Error ? error.message : String(error)}`),
  );
  process.exit(1);
}

const duration = (performance.now() - startTime).toFixed(2);
console.log('');
console.log(chalk.bold.green('Migration générée avec succès!'));
console.log(chalk.gray('├─ Time :   ') + chalk.white(`${duration}ms`));
console.log(chalk.gray('└─ Sortie : ') + chalk.white(outPath));
console.log('');
console.log(
  chalk.gray('Pour appliquer : ') + chalk.white('bun run db:migrate'),
);
console.log('');
