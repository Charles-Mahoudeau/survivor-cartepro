/**
 * A refused payment is kept as a row: the export the brief asks for lists
 * refusals next to validated payments. It carries no wallet entry.
 */
export enum PaymentStatus {
  VALIDATED = 'validated',
  REFUSED = 'refused',
}
