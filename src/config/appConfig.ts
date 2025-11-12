/**
 * Central application configuration. All tunable values that influence API requests,
 * caching behavior, and feature limits live here so the entire app can share the
 * same source of truth. This makes it simple to reuse the approach in other projects
 * and avoids scattering hard-coded values throughout the codebase.
 */
export const appConfig = {
  site: {
    name: 'zenOSmosis',
    baseUrl: 'https://zenosmosis.com',
    blogPath: 'https://blog.zenosmosis.com',
    contactEmail: 'info@zenosmosis.com',
    contactPhone: '+1-415-562-7140',

    // Keep titles under ~55–60 chars; use the same across <title>, og:title, twitter:title.
    // A: broader positioning
    title: 'zenOSmosis — Systems Studio and Open Lab',
    // B (alt you can A/B later): 'zenOSmosis — Engineering Craftsmanship'

    // Use two descriptions: one longer for SEO, one short for social cards.
    // ~150–160 chars helps SEO snippets; ~90–110 chars is ideal for social.
    description:
      'Open-source data systems and tooling: storage engines, SQL, infrastructure, and clear documentation',
    socialDescription:
      'Open-source data systems and tooling: storage, SQL, and infra',

    // Keep this lean; prioritize intent over a long comma soup.
    keywords:
      'Rust, data systems, storage engine, SQL, Apache Arrow, performance, infrastructure, Docker, MQTT, documentation',

    // Author credit (used in meta=author if you surface it)
    author: 'Jeremy Harris',
    authorSlug: 'jeremy-harris',

    // Use an absolute URL so all platforms resolve it reliably.
    socialImage: '/social/zenOSmosis-card-1200x630.jpg',
    socialImageAlt: 'zenOSmosis — Open-source Rust data systems and tools',

    // (Optional but useful if you wire it into meta tags)
    siteName: 'zenOSmosis',
    locale: 'en_US',
    twitterHandle: '', // e.g., '@yourhandle' if you get one later
    
    // Organization details for structured data
    organizationDescription: 'zenOSmosis develops high-performance open-source data systems, storage engines, SQL tooling, and infrastructure projects with comprehensive technical documentation.',
    foundingDate: '2010-07-15',
    
    // Person/author details for structured data
    authorJobTitle: 'Software Engineer & Systems Architect',
    authorDescription: 'Software engineer specializing in high-performance data systems, storage engines, and infrastructure tooling.',
    languages: ['en'],
    areaServed: 'Worldwide',
  },
  github: {
    username: 'jzombie',
    orgUsername: 'zenOSmosis',
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
  social: {
    linkedinSlug: 'jeremyharrisconsultant',
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

export const githubUrl = `https://github.com/${appConfig.github.username}`;
export const githubOrgUrl = `https://github.com/${appConfig.github.orgUsername}`;
export const cratesUrl = `https://crates.io/users/${appConfig.crates.username}?sort=downloads`;
export const linkedInUrl = `https://www.linkedin.com/in/${appConfig.social.linkedinSlug}`;
