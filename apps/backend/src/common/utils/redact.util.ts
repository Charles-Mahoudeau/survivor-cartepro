import {
  REDACTED_KEYS,
  REDACTED_PLACEHOLDER,
  REDACTION_MAX_DEPTH,
  TRUNCATED_PLACEHOLDER,
} from '../constants/logging.constants';

/**
 * Normalizes a key the same way the denylist is normalized: lowercased, `_` and
 * `-` stripped, so one entry covers every spelling of the same field.
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_-]/g, '');
}

/**
 * Returns a copy of `value` with every denylisted key replaced by the redaction
 * placeholder. Pure and NON-MUTATING — the interceptor runs before the handler,
 * so writing back into the input would corrupt `request.body` in flight.
 *
 * Primitives pass through untouched; objects and arrays are rebuilt. Past
 * `REDACTION_MAX_DEPTH` the node becomes the truncation marker instead of being
 * walked, which also terminates a self-referencing structure.
 * @param value - anything about to be logged
 * @param depth - current walk depth, internal
 * @returns a new structure safe to serialize into a log line
 */
export function redact(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (depth >= REDACTION_MAX_DEPTH) {
    return TRUNCATED_PLACEHOLDER;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    result[key] = REDACTED_KEYS.has(normalizeKey(key))
      ? REDACTED_PLACEHOLDER
      : redact(item, depth + 1);
  }
  return result;
}
