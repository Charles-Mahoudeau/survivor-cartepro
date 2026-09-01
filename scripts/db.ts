#!/usr/bin/env bun
/**
 * Base de données locale — deux implémentations, la même interface.
 *
 *   bun run db:up            PostgreSQL natif, fourni par le flake
 *   bun run db:up --docker   le service `postgres` de docker-compose.yaml
 *
 * Le natif est le défaut : il ne demande que les binaires PostgreSQL, déjà
 * présents dans le devShell. Aucun démon, aucune machine virtuelle. Sans eux,
 * on retombe sur docker.
 *
 * Ce que fait `up` est ce que l'entrypoint de l'image postgres fait dans un
 * conteneur : `initdb` crée le répertoire de données et le rôle, `pg_ctl`
 * démarre le serveur, `createdb` crée la base applicative.
 *
 * Le cluster vit hors du dépôt, dans un répertoire dérivé du chemin du clone :
 * deux clones ont deux bases indépendantes, et surtout la socket du serveur
 * reste hors de l'arbre de travail — un flake sur un chemin local recopie cet
 * arbre dans le magasin nix, ce qui échoue sur un fichier de type socket.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import chalk from 'chalk';

interface Context {
  root: string;
  state: string;
  data: string;
  socket: string;
  log: string;
  host: string;
  port: string;
  user: string;
  password: string;
  db: string;
}

const ok = (message: string) => console.log(`  ${chalk.green('✓')} ${message}`);
const ko = (message: string) => console.log(`  ${chalk.red('✗')} ${message}`);
const info = (message: string) =>
  console.log(`  ${chalk.gray('·')} ${message}`);
const title = (message: string) => console.log(chalk.bold.cyan(message));

/** Les défauts de apps/backend/src/config/env/env.schema.ts. */
const DEFAULTS: Record<string, string> = {
  DATABASE_PORT: '5432',
  DATABASE_USER: 'cartepro',
  DATABASE_PASSWORD: 'cartepro',
  DATABASE_NAME: 'cartepro',
};

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const entries: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    entries[trimmed.slice(0, separator).trim()] = trimmed
      .slice(separator + 1)
      .trim();
  }
  return entries;
}

function context(): Context {
  const root = dirname(import.meta.dir);
  const env = { ...DEFAULTS, ...readEnvFile(join(root, '.env')) };
  // DATABASE_HOST de .env est l'adresse à laquelle l'application se connecte ;
  // le serveur, lui, n'écoute jamais qu'en boucle locale.
  const stateHome =
    process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state');
  // Une empreinte du chemin du clone : deux copies du dépôt sur la même
  // machine ne se partagent ni les données ni la socket.
  const key = createHash('sha256').update(root).digest('hex').slice(0, 12);
  const state = join(stateHome, 'cartepro', key);

  return {
    root,
    state,
    data: join(state, 'data'),
    socket: join(state, 'run'),
    log: join(state, 'postgres.log'),
    host: '127.0.0.1',
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    db: env.DATABASE_NAME,
  };
}

interface Result {
  code: number;
  stdout: string;
  stderr: string;
}

function run(command: string[], options: { cwd?: string } = {}): Result {
  const spawned = Bun.spawnSync(command, {
    cwd: options.cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return {
    code: spawned.exitCode,
    stdout: spawned.stdout.toString(),
    stderr: spawned.stderr.toString(),
  };
}

/** Le démon docker ne s'installe pas de la même façon selon la plateforme. */
function dockerDaemonHint(): string {
  return process.platform === 'darwin'
    ? 'Docker Desktop, OrbStack ou colima'
    : 'le service docker de la distribution, ou Podman via son API compatible';
}

type Backend = 'native' | 'docker';

/**
 * Qui va servir la base. `--docker` force le conteneur ; sinon les binaires
 * PostgreSQL gagnent, et docker sert de repli pour qui n'a pas nix.
 */
function backend(forced: boolean): Backend {
  if (forced) {
    requireDocker();
    return 'docker';
  }
  if (Bun.which('initdb') !== null && Bun.which('pg_ctl') !== null) {
    return 'native';
  }
  if (Bun.which('docker')) {
    info('binaires PostgreSQL absents : passage par docker');
    return 'docker';
  }
  ko('ni PostgreSQL ni docker');
  info('avec nix : nix develop, puis bun run db:up');
  info(
    `sans nix : un démon docker (${dockerDaemonHint()}), puis bun run db:up`,
  );
  process.exit(1);
}

function requireDocker(): void {
  if (Bun.which('docker')) return;
  ko('docker introuvable');
  info(`le démon vient de ${dockerDaemonHint()}`);
  process.exit(1);
}

function compose(args: string[]): never {
  requireDocker();
  const spawned = Bun.spawnSync(['docker', 'compose', ...args], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  process.exit(spawned.exitCode);
}

function running(c: Context): boolean {
  if (!existsSync(c.data)) return false;
  return run(['pg_ctl', '-D', c.data, 'status']).code === 0;
}

function initCluster(c: Context): void {
  title('initialisation du cluster');
  mkdirSync(c.state, { recursive: true });
  const passwordFile = join(c.state, '.initpw');
  writeFileSync(passwordFile, c.password, { mode: 0o600 });

  const result = run([
    'initdb',
    '-D',
    c.data,
    '-U',
    c.user,
    '--pwfile',
    passwordFile,
    '--auth-local=trust',
    '--auth-host=scram-sha-256',
    '--encoding=UTF8',
    '--locale=C',
  ]);
  rmSync(passwordFile, { force: true });

  if (result.code !== 0) {
    ko('initdb a échoué');
    console.log(result.stderr.trim());
    process.exit(1);
  }
  info(c.data);
}

/**
 * L'administration passe par la socket Unix, où `initdb` a posé une
 * authentification `trust` : pas de mot de passe à promener. L'application, elle,
 * arrive en TCP et s'authentifie en scram.
 */
function ensureDatabase(c: Context): void {
  const exists = run([
    'psql',
    '-h',
    c.socket,
    '-p',
    c.port,
    '-U',
    c.user,
    '-d',
    'postgres',
    '-tAc',
    `SELECT 1 FROM pg_database WHERE datname = '${c.db}'`,
  ]);
  if (exists.stdout.trim() === '1') return;

  const created = run([
    'createdb',
    '-h',
    c.socket,
    '-p',
    c.port,
    '-U',
    c.user,
    '-O',
    c.user,
    c.db,
  ]);
  if (created.code !== 0) {
    ko(`création de la base ${c.db} impossible`);
    console.log(created.stderr.trim());
    process.exit(1);
  }
  info(`base ${c.db} créée`);
}

function tail(path: string, lines = 15): string {
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8').split('\n').slice(-lines).join('\n');
}

function up(c: Context, forced: boolean): void {
  if (backend(forced) === 'docker') compose(['up', 'postgres', '-d']);

  if (!existsSync(c.data)) initCluster(c);
  if (running(c)) {
    info(`PostgreSQL écoute déjà sur ${c.host}:${c.port}`);
    return;
  }

  mkdirSync(c.socket, { recursive: true });
  const started = run([
    'pg_ctl',
    '-D',
    c.data,
    '-l',
    c.log,
    '-w',
    '-o',
    `-c listen_addresses=${c.host} -p ${c.port} -k ${c.socket}`,
    'start',
  ]);

  if (started.code !== 0) {
    const log = tail(c.log);
    ko("PostgreSQL n'a pas démarré");
    if (
      /could not bind|Address already in use|adresse déjà utilisée/i.test(log)
    ) {
      info(
        `le port ${c.port} est déjà pris — un autre clone tourne peut-être : ` +
          'changer DATABASE_PORT dans .env',
      );
    }
    console.log(log);
    process.exit(1);
  }

  ensureDatabase(c);
  ok(`PostgreSQL ${c.user}@${c.host}:${c.port}/${c.db}`);
}

function down(c: Context, forced: boolean): void {
  if (backend(forced) === 'docker') compose(['down', 'postgres']);

  if (!running(c)) {
    info('PostgreSQL est déjà arrêté');
    return;
  }
  const stopped = run(['pg_ctl', '-D', c.data, '-w', '-m', 'fast', 'stop']);
  if (stopped.code !== 0) {
    ko(stopped.stderr.trim());
    process.exit(1);
  }
  ok('PostgreSQL arrêté');
}

/** L'équivalent de `docker compose down -v` : les données partent avec. */
function nuke(c: Context, forced: boolean): void {
  if (backend(forced) === 'docker') compose(['down', 'postgres', '-v']);

  if (running(c))
    run(['pg_ctl', '-D', c.data, '-w', '-m', 'immediate', 'stop']);
  rmSync(c.state, { recursive: true, force: true });
  ok('cluster supprimé');
}

function status(c: Context, forced: boolean): void {
  if (backend(forced) === 'docker') compose(['ps', 'postgres']);

  if (running(c)) {
    ok(`PostgreSQL ${c.user}@${c.host}:${c.port}/${c.db} — ${c.data}`);
  } else {
    info(`PostgreSQL arrêté — ${c.data}`);
  }
}

function shell(c: Context, forced: boolean): never {
  if (backend(forced) === 'docker') {
    compose(['exec', 'postgres', 'psql', '-U', c.user, '-d', c.db]);
  }
  const spawned = Bun.spawnSync(
    ['psql', '-h', c.socket, '-p', c.port, '-U', c.user, '-d', c.db],
    { stdin: 'inherit', stdout: 'inherit', stderr: 'inherit' },
  );
  process.exit(spawned.exitCode);
}

const [command, ...flags] = process.argv.slice(2);
const docker = flags.includes('--docker');
const c = context();

switch (command) {
  case 'up':
    up(c, docker);
    break;
  case 'down':
    down(c, docker);
    break;
  case 'nuke':
    nuke(c, docker);
    break;
  case 'status':
    status(c, docker);
    break;
  case 'shell':
    shell(c, docker);
    break;
  default:
    console.log(
      'usage: bun scripts/db.ts up|down|nuke|status|shell [--docker]',
    );
    process.exit(command ? 1 : 0);
}
