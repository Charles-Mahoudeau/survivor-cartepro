import type { SeededRandom } from './random';

const UUID_BYTES = 16;
const TIMESTAMP_BYTES = 6;

/**
 * A UUIDv7 whose 48 timestamp bits are `at` and whose 74 random bits come from
 * the seeded generator: it sorts like the ones `uuidv7()` mints in Postgres,
 * but two runs mint the same one for the same event.
 */
export function uuidv7At(at: Date, random: SeededRandom): string {
  const bytes = new Uint8Array(UUID_BYTES);

  let timestamp = at.getTime();
  for (let index = TIMESTAMP_BYTES - 1; index >= 0; index--) {
    bytes[index] = timestamp % 256;
    timestamp = Math.floor(timestamp / 256);
  }

  for (let index = TIMESTAMP_BYTES; index < UUID_BYTES; index++) {
    bytes[index] = random.int(0, 255);
  }
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
