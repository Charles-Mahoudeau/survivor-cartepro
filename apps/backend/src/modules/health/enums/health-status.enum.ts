export enum HealthStatus {
  /** Every dependency answered. */
  OK = 'ok',
  /** The process is up, but something it needs is not. */
  DEGRADED = 'degraded',
}
