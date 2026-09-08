/**
 * One value per operation the letter asks to trace. Kept at its full
 * ten-label granularity (account created vs updated, partner approved vs
 * refused, transaction approved vs refused) instead of merged down to its
 * own looser count of nine: a merged action can never be split back apart
 * once written, a granular one can always be grouped by a reader.
 */
export enum AuditAction {
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_UPDATED = 'account_updated',
  ROLE_CHANGED = 'role_changed',
  PARTNER_APPROVED = 'partner_approved',
  PARTNER_REFUSED = 'partner_refused',
  ALLOCATION_APPLIED = 'allocation_applied',
  TRANSACTION_APPROVED = 'transaction_approved',
  TRANSACTION_REFUSED = 'transaction_refused',
  LOGIN_FAILED = 'login_failed',
  ADMIN_ACTION = 'admin_action',
}
