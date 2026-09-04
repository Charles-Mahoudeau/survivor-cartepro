import 'server-only';

const DEVELOPMENT_DEFAULTS: Record<string, string> = {
  BACKEND_INTERNAL_URL: 'http://localhost:3001',
  APP_ORIGIN: 'http://localhost:3000',
};

function read(name: keyof typeof DEVELOPMENT_DEFAULTS): string {
  const value = process.env[name];
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEVELOPMENT_DEFAULTS[name]!;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function backendInternalUrl(): string {
  return read('BACKEND_INTERNAL_URL');
}

export function appOrigin(): string {
  return read('APP_ORIGIN');
}
