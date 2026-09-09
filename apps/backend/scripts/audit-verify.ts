#!/usr/bin/env bun
import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import '../src/config/env/load-env';
import { verifyChain } from '../src/modules/audit/services/helpers/chain-verifier.helper';
import {
  verifyAuditExportSignature,
  type SignedAuditExport,
} from '../src/modules/audit/services/helpers/export-signer.helper';

/**
 * Verifies one exported period of the audit chain from the file alone: no
 * database connection, no network call. This is the command the one-page
 * note describes and the démonstration script runs.
 *
 * Two independent checks, in order: the HMAC-SHA256 signature (did this
 * exact file come from someone holding the signing secret, unmodified since
 * export?), then the hash chain within it (is it an unbroken sequence, or
 * does it show an edited row or a gap where one was removed?). Either can
 * fail on its own — a forged file with no valid signature never gets to the
 * chain check.
 */

const [filePath, ...rest] = process.argv.slice(2);

function usage(): never {
  console.log('');
  console.log(
    chalk.bold.red(
      'Usage : bun scripts/audit-verify.ts <export.json> [--secret <clé>]',
    ),
  );
  console.log(
    chalk.gray(
      '└─ Sans --secret, la clé est lue dans AUDIT_EXPORT_SIGNING_SECRET.',
    ),
  );
  console.log('');
  process.exit(1);
}

if (!filePath) {
  usage();
}

const secretFlagIndex = rest.indexOf('--secret');
const secret =
  secretFlagIndex !== -1
    ? rest[secretFlagIndex + 1]
    : process.env.AUDIT_EXPORT_SIGNING_SECRET;

if (!secret) {
  console.log('');
  console.log(
    chalk.bold.red(
      'Aucune clé de signature : passe --secret <clé> ou définis AUDIT_EXPORT_SIGNING_SECRET.',
    ),
  );
  console.log('');
  process.exit(1);
}

let signed: SignedAuditExport;
try {
  signed = JSON.parse(readFileSync(filePath, 'utf8')) as SignedAuditExport;
} catch (error) {
  console.log('');
  console.log(chalk.bold.red(`Impossible de lire ${filePath}.`));
  console.log(chalk.gray('└─ ') + chalk.white(String(error)));
  console.log('');
  process.exit(1);
}

console.log('');
console.log(chalk.gray('Fichier :  ') + chalk.white(filePath));
console.log(
  chalk.gray('Période :  ') +
    chalk.white(`${signed.period.from} → ${signed.period.to ?? '(ouverte)'}`),
);

const signatureValid = verifyAuditExportSignature(signed, secret);
console.log(
  chalk.gray('Signature: ') +
    (signatureValid
      ? chalk.bold.green('valide')
      : chalk.bold.red('INVALIDE — le fichier ne correspond pas à cette clé')),
);

if (!signatureValid) {
  console.log('');
  console.log(chalk.bold.red('VERDICT : NON CONFORME (signature invalide)'));
  console.log('');
  process.exit(1);
}

// A signed export cannot prove what preceded its own first entry without
// the database — the first row's own previousHash is trusted as the
// boundary, and only the links between the rows the export actually holds
// are checked. See `verifyChain`'s own doc for why that is still meaningful.
const firstPreviousHash = signed.entries[0]?.previousHash ?? null;
const result = verifyChain(signed.entries, firstPreviousHash);

console.log(
  chalk.gray('Chaîne :   ') +
    chalk.white(`${result.checked} enregistrement(s) vérifié(s)`),
);

if (result.ok) {
  console.log('');
  console.log(chalk.bold.green('VERDICT : CONFORME'));
  console.log('');
  process.exit(0);
}

console.log('');
console.log(chalk.bold.red('VERDICT : NON CONFORME'));
for (const anomaly of result.anomalies) {
  if (anomaly.type === 'tampered') {
    console.log(
      chalk.red(
        `├─ Enregistrement #${anomaly.index} (id ${anomaly.id}) modifié : ` +
          'son contenu ne correspond plus à son empreinte enregistrée.',
      ),
    );
  } else {
    console.log(
      chalk.red(
        `├─ Rupture avant l'enregistrement #${anomaly.index} (id ${anomaly.id}) : ` +
          'un enregistrement qui devait le précéder est absent.',
      ),
    );
  }
}
console.log('');
process.exit(1);
