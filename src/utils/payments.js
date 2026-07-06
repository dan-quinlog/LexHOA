// Statuses that represent money submitted but not yet applied to the real balance.
// eCheck (ACH) payments stay in one of these states for 1-5 business days until
// they settle, at which point the server-side balance is reduced.
export const PENDING_STATUSES = ['PENDING', 'PROCESSING'];

// Total dollar amount of payments that are still pending settlement.
export const getPendingTotal = (payments = []) =>
  Math.round(
    payments
      .filter((p) => PENDING_STATUSES.includes(p?.status))
      .reduce((sum, p) => sum + (p?.amount || 0), 0) * 100
  ) / 100;

// The balance shown to the owner, treating pending payments as if they were
// already applied so a pending payment "feels" complete. Never goes below zero.
export const getEffectiveBalance = (balance = 0, pendingTotal = 0) =>
  Math.max(0, Math.round(((balance || 0) - pendingTotal) * 100) / 100);
