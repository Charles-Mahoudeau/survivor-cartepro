#!/usr/bin/env bun
import { rm, stat } from 'node:fs/promises';
import { build } from 'bun';
import chalk from 'chalk';
import packageJson from '../package.json';

const BUNDLE_PATH = './dist/main.js';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
};

const startTime = performance.now();

console.log(chalk.gray('Cleaning dist folder...'));
await rm('./dist', { recursive: true, force: true });

const prodDeps = Object.keys(packageJson.dependencies || {});
// Optional Nest packages, resolved lazily by the framework and not installed.
const nestOptionals = [
  '@nestjs/microservices',
  '@nestjs/websockets',
  '@nestjs/platform-socket.io',
  '@nestjs/platform-fastify',
  '@nestjs/platform-ws',
  '@nestjs/mapped-types',
  'class-transformer/storage',
  '@fastify/static',
];

console.log(chalk.gray(`Externalizing ${prodDeps.length} dependencies...`));
console.log(chalk.gray('Compiling with Bun...'));

const result = await build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  target: 'bun',
  sourcemap: 'external',
  minify: { syntax: true, whitespace: true, identifiers: false },
  external: [...prodDeps, ...nestOptionals],
  splitting: false,
});

if (!result.success) {
  console.log('');
  console.log(chalk.bold.red('Build failed'));
  for (const message of result.logs) {
    console.log(chalk.red(`└─ ${message.message}`));
  }
  process.exit(1);
}

const stats = await stat(BUNDLE_PATH);
const duration = (performance.now() - startTime).toFixed(2);

console.log('');
console.log(chalk.bold.green('Build successful!'));
console.log(chalk.gray('├─ Time: ') + chalk.white(`${duration}ms`));
console.log(chalk.gray('├─ Size: ') + chalk.white(formatBytes(stats.size)));
console.log(chalk.gray('└─ Path: ') + chalk.gray(BUNDLE_PATH));
console.log('');
