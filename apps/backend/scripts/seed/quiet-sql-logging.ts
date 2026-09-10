/**
 * A seed run makes about a thousand statements and the point of it is the
 * summary at the end, so the connection stays quiet.
 *
 * A side-effect import rather than a line in the script body, and the first
 * one `db-seed.ts` lists: `ConfigModule.forRoot` reads, validates and freezes
 * the environment while `app.module.ts` is being evaluated, which is before
 * any statement of an importing module runs. `data-source.ts` imports
 * `load-env` the same way, for the same reason.
 *
 * Setting it here rather than in the command that starts the file keeps the
 * guarantee whichever way the file is started, `bun scripts/db-seed.ts`
 * included — the shebang invites exactly that.
 */
process.env.DATABASE_LOGGING = 'false';
