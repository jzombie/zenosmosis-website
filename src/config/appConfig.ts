/**
 * Central application configuration. All tunable values that influence API requests,
 * caching behaviour, and feature limits live here so the entire app can share the
 * same source of truth. This makes it simple to reuse the approach in other projects
 * and avoids scattering hard-coded values throughout the codebase.
 */
export const appConfig = {
  github: {
    username: 'jzombie',
    /** Number of recent activity items to show in the sidebar feed. */
    recentActivityLimit: 6,
    /** How many events to request from the GitHub events API at once. */
    eventsPerPage: 20,
    /** Maximum number of repositories to sample when aggregating language + contributor stats. */
    repoSampleSize: 8,
  },
  crates: {
    username: 'jzombie',
    maxCrates: 4,
    historyDays: 30,
  },
  queryCache: {
    /** Duration (ms) to treat cached data as fresh before background refetch. */
    staleTimeMs: 1000 * 60 * 15,
    /** Duration (ms) until cached queries are garbage collected in memory. */
    gcTimeMs: 1000 * 60 * 60,
    /** How many retry attempts to make for failed queries (excluding rate-limit responses). */
    maxRetryAttempts: 2,
    /** Storage key used to persist the TanStack Query cache. */
    storageKey: 'zenosmosis-query-cache',
    /** Maximum age (ms) for persisted cache entries in localStorage. */
    persistedMaxAgeMs: 1000 * 60 * 60 * 12,
  },
} as const;

export type AppConfig = typeof appConfig;
