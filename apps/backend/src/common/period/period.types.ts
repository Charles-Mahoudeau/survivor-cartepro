/** A resolved read window: `from` is always known, `to` is open when absent. */
export type Period = {
  from: Date;
  to: Date | null;
};
