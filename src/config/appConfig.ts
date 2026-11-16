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
    title: 'zenOSmosis — Open-Source Systems That Fit Together',

    // Use two descriptions: one longer for SEO, one short for social cards.
    // ~150–160 chars helps SEO snippets; ~90–110 chars is ideal for social.
    description:
      'Open-source infrastructure, terminals, storage, and ML pipelines — reusable pieces of one cohesive system, built in the open.',
    socialDescription:
      'Open-source systems that fit together',

    // Keep this lean; prioritize intent over a long comma soup.
    keywords:
      'Rust, storage engine, SQL, terminal, virtualization, QEMU, SSH, infrastructure, Docker, MQTT',

    // Author credit (used in meta=author if you surface it)
    author: 'Jeremy Harris',
    authorSlug: 'jeremy-harris',

    // Use an absolute URL so all platforms resolve it reliably.
    socialImage: '/social/zenOSmosis-card-1200x630.jpg',
    socialImageAlt: 'zenOSmosis — Open-source systems that fit together',

    // (Optional but useful if you wire it into meta tags)
    siteName: 'zenOSmosis',
    locale: 'en_US',
    twitterHandle: '', // e.g., '@yourhandle' if you get one later
    
    // Organization details for structured data
    organizationDescription: 'zenOSmosis builds open-source systems that fit together: infrastructure, terminal environments, storage engines, and research pipelines — reusable pieces of one cohesive stack.',
    foundingDate: '2010-07-15',
    
    // Person/author details for structured data
    authorJobTitle: 'Software Engineer & Systems Architect',
    authorDescription: 'Software engineer building open-source systems that fit together: reusable infrastructure, terminals, storage, and pipelines.',
    languages: ['en'],
    areaServed: 'Worldwide',
  },
  github: {
    personalUsername: 'jzombie',
    organizationUsername: 'zenOSmosis',
    /** Number of recent activity items to show in the sidebar feed. */
    recentActivityLimit: 6,
    /** How many events to request from the GitHub events API at once. */
    eventsPerPage: 20,
    /** Maximum number of repositories to sample when aggregating language + contributor stats. */
    repoSampleSize: 8,
  },
  crates: {
    personalUsername: 'jzombie',
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
  llms: {
    /** Audience line appended to the generated llms.txt summary blockquote. */
    audience: 'Built for systems engineers and curious builders.',
    /** Link notes for the generated llms.txt / llms-full.txt index sections. */
    homeBlurb: 'Project hub, hero intro, and live GitHub and crates.io activity.',
    blogBlurb: 'Long-form engineering notes, systems design, and Magnet Vector essays.',
    postsBlurb: 'Full post index for the garden and notes.',
    researchBlurb:
      'Personal repositories, systems experiments, and research prototypes.',
    studioBlurb: 'Studio organization and cohesive system pieces.',
    cratesBlurb: 'Published Rust crates by download count.',
    rssBlurb: 'Blog activity feed in RSS format.',
    atomBlurb: 'Blog activity feed in Atom format.',
    jsonBlurb: 'Blog activity feed in JSON format.',
    fullBlurb:
      'Complete version of this index with full per-project detail by category.',
    contactBlurb: 'Email the studio for questions or collaboration.',
    /** Fallback when a graph node has no description. */
    noDescription: 'No description.',
    /** Paragraph templates ({tokens} are filled by the generator, never edited there). */
    introTemplate:
      "{name} is {author}'s open-source studio and project hub at {baseUrl}, with long-form notes at {blogPath}. The hub lists actively maintained systems across {scope}. Contact: {contactEmail}.",
    fullIntroTemplate:
      '{name} is {author}’s open-source studio and project hub at {baseUrl}, with long-form notes at {blogPath}. This is the complete version of {baseUrl}/llms.txt, generated at build time from the site’s own data (src/projects.ts, src/config/appConfig.ts) — the same sources behind the homepage and its JSON-LD graph{graphNote}.',
    graphNoteTemplate:
      ' — spliced with portfolio-graph.json schema v{schemaVersion}, generated {generatedAt}',
    graphOfflineNote:
      ' (portfolio graph unreachable at build time; internal data only)',
    /** Section headings for the generated files. */
    mainHeading: 'Main',
    projectsHeading: 'Projects',
    profilesHeading: 'Profiles',
    optionalHeading: 'Optional',
    moreHeading: 'More visible in the portfolio graph',
    /** Detail labels for the generated files. */
    languagesLabel: 'languages',
    stackLabel: 'stack',
    crateLabel: 'crate',
    docsLabel: 'docs',
    topicsLabel: 'topics',
    licenseLabel: 'license',
    layerLabel: 'layer',
    languageLabel: 'language',
    homepageLabel: 'homepage',
    connectsToLabel: 'connects to',
    usedByLabel: 'used by',
  },
} as const;

export type AppConfig = typeof appConfig;

export const githubPersonalUrl = `https://github.com/${appConfig.github.personalUsername}`;
export const githubOrganizationUrl = `https://github.com/${appConfig.github.organizationUsername}`;
export const cratesPersonalUrl = `https://crates.io/users/${appConfig.crates.personalUsername}?sort=downloads`;
