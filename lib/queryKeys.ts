/**
 * Centralised query-key factory for TanStack Query.
 * Keeps cache invalidation consistent across the app.
 */

export const queryKeys = {
  circles: {
    all: () => ["circles"] as const,
    list: () => ["circles", "list"] as const,
    detail: (id: string) => ["circles", "detail", id] as const,
  },
  contributions: {
    all: () => ["contributions"] as const,
    list: () => ["contributions", "list"] as const,
  },
  payouts: {
    all: () => ["payouts"] as const,
    list: () => ["payouts", "list"] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
  },
} as const;
