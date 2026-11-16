/**
 * Build-time generator for public/llms.txt and public/llms-full.txt.
 *
 * Data comes from OUR OWN internal representation — the same modules that
 * drive the site and the JSON-LD @graph in src/utils/structuredData.ts:
 *   1. src/config/appConfig.ts — site header, URLs, contact
 *   2. src/projects.ts          — curated hub projects, in hub order
 * Loaded by transpiling those files with the project's own TypeScript
 * compiler (no regex parsing, no new dependencies), so formatting changes
 * in the sources can never break this script.
 *
 * Spliced in at build time per the portfolio graph
 * (https://github.com/jzombie/jzombie-graph, data/portfolio-graph.json):
 *   - Curated projects keep their hand-written descriptions (presentation copy wins).
 *   - The graph contributes topics, docs/crates homepage links, license, layer,
 *     and per-project dependency relations ("connects to" / "used by").
 *   - Graph-visible repos NOT in the curated list appear only in llms-full.txt,
 *     so llms.txt stays token-lean and mirrors the human hub 1:1.
 *
 * Offline safety: a failed fetch degrades to local-only data for ad-hoc builds,
 * but fails loudly under CI (`CI=true`, set by GitHub Actions) so a degraded
 * artifact can never deploy silently.
 *
 * llms.txt      — token-lean index. Mirrors the human hub 1:1.
 * llms-full.txt — complete variant. Full per-project detail, grouped by category.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GRAPH_URL =
  'https://raw.githubusercontent.com/jzombie/jzombie-graph/refs/heads/main/data/portfolio-graph.json';

const LLMS_PATH = join(ROOT, 'public', 'llms.txt');
const FULL_PATH = join(ROOT, 'public', 'llms-full.txt');

/**
 * Load a .ts data module by transpiling it with the project's own
 * TypeScript compiler, then importing the result. Works with native objects —
 * no static parsing, so source formatting is irrelevant.
 */
async function loadTsModule(relPath) {
  const require = createRequire(join(ROOT, 'package.json'));
  const ts = require('typescript');
  const src = readFileSync(join(ROOT, relPath), 'utf-8');
  const { outputText, diagnostics } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  const errors = (diagnostics ?? []).filter(
    (d) => d.category === ts.DiagnosticCategory.Error,
  );
  if (errors.length > 0) {
    throw new Error(
      `failed to transpile ${relPath}: ${errors
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
        .join('; ')}`,
    );
  }
  const dir = mkdtempSync(join(tmpdir(), 'zenosmosis-llms-'));
  try {
    const outPath = join(dir, relPath.replaceAll('/', '_').replace(/\.ts$/, '.mjs'));
    writeFileSync(outPath, outputText);
    return await import(pathToFileURL(outPath).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function loadGraph() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(GRAPH_URL, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const repoId = (url) => url.replace(/^https:\/\/github\.com\//, '');
const repoUrl = (id) => `https://github.com/${id}`;
const shortName = (id) => id.replace(/^[^/]+\//, '');

/** Comma list of `[name](url) (kind)` for one side of an edge list. */
function edgeList(edges, pick) {
  return edges
    .map((e) => `[${shortName(pick(e))}](${repoUrl(pick(e))}) (${e.kind})`)
    .join(', ');
}



export async function generateLlms() {
  const [{ projects }, { appConfig }] = await Promise.all([
    loadTsModule('src/projects.ts'),
    loadTsModule('src/config/appConfig.ts'),
  ]);
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('src/projects.ts exported no projects');
  }
  // Optional array fields may be absent on some projects — normalize.
  for (const p of projects) {
    p.languages ??= [];
    p.technologies ??= [];
    p.crates ??= [];
  }

  // No silent hardcoded fallbacks: fail loudly on missing config.
  const need = (value, label) => {
    if (!value) throw new Error(`src/config/appConfig.ts is missing ${label}`);
    return value;
  };
  const site = {
    name: need(appConfig.site?.name, 'site.name'),
    baseUrl: need(appConfig.site?.baseUrl, 'site.baseUrl'),
    blogPath: need(appConfig.site?.blogPath, 'site.blogPath'),
    contactEmail: need(appConfig.site?.contactEmail, 'site.contactEmail'),
    description: need(appConfig.site?.description, 'site.description'),
    author: need(appConfig.site?.author, 'site.author'),
    personalUsername: need(appConfig.github?.personalUsername, 'github.personalUsername'),
    organizationUsername: need(
      appConfig.github?.organizationUsername,
      'github.organizationUsername',
    ),
    personalCrateUser: need(appConfig.crates?.personalUsername, 'crates.personalUsername'),
  };
  // All authored copy lives in appConfig.llms — the script renders, never writes, prose.
  const copy = need(appConfig.llms, 'llms copy');
  const needCopy = (value, label) => {
    if (typeof value !== 'string' || value.length === 0)
      throw new Error(`src/config/appConfig.ts is missing llms.${label}`);
    return value;
  };
  const audience = needCopy(copy.audience, 'audience');
  const blurbs = {
    home: needCopy(copy.homeBlurb, 'homeBlurb'),
    blog: needCopy(copy.blogBlurb, 'blogBlurb'),
    posts: needCopy(copy.postsBlurb, 'postsBlurb'),
    research: needCopy(copy.researchBlurb, 'researchBlurb'),
    studio: needCopy(copy.studioBlurb, 'studioBlurb'),
    crates: needCopy(copy.cratesBlurb, 'cratesBlurb'),
    rss: needCopy(copy.rssBlurb, 'rssBlurb'),
    atom: needCopy(copy.atomBlurb, 'atomBlurb'),
    json: needCopy(copy.jsonBlurb, 'jsonBlurb'),
    full: needCopy(copy.fullBlurb, 'fullBlurb'),
    contact: needCopy(copy.contactBlurb, 'contactBlurb'),
    noDescription: needCopy(copy.noDescription, 'noDescription'),
  };
  const fmt = (template, vars) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template);
  const text = (key) => needCopy(copy[key], key);
  const headings = {
    main: text('mainHeading'),
    projects: text('projectsHeading'),
    profiles: text('profilesHeading'),
    optional: text('optionalHeading'),
    more: text('moreHeading'),
  };
  const labels = {
    languages: text('languagesLabel'),
    stack: text('stackLabel'),
    crate: text('crateLabel'),
    docs: text('docsLabel'),
    topics: text('topicsLabel'),
    license: text('licenseLabel'),
    layer: text('layerLabel'),
    language: text('languageLabel'),
    homepage: text('homepageLabel'),
    connectsTo: text('connectsToLabel'),
    usedBy: text('usedByLabel'),
  };
  const templates = {
    intro: text('introTemplate'),
    fullIntro: text('fullIntroTemplate'),
    graphNote: text('graphNoteTemplate'),
    graphOffline: text('graphOfflineNote'),
  };
  const { baseUrl, blogPath } = site;
  const postsUrl = `${blogPath.replace(/\/$/, '')}/posts`;

  // Graceful degradation locally; fatal under CI so degraded output can't deploy silently.
  let graph = null;
  try {
    graph = await loadGraph();
  } catch (err) {
    if (process.env.CI) {
      throw new Error(`portfolio graph fetch failed: ${err.message}`);
    }
    console.warn(`[llms] graph fetch failed (${err.message}); local data only.`);
  }

  const nodes = new Map((graph?.nodes ?? []).map((n) => [n.id, n]));
  const visible = (graph?.nodes ?? []).filter((n) => n.visible);
  const curatedIds = new Set(projects.map((p) => repoId(p.repoUrl)));

  if (graph) {
    for (const p of projects) {
      if (!nodes.has(repoId(p.repoUrl))) {
        console.warn(`[llms] curated project has no graph node: ${p.repoUrl}`);
      }
    }
  }

  const extra = visible
    .filter((n) => !curatedIds.has(n.id))
    .sort((a, b) => a.id.localeCompare(b.id));

  const visibleIds = new Set(visible.map((n) => n.id));
  const edges = (graph?.edges ?? [])
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));

  const outgoing = new Map();
  const incoming = new Map();
  for (const e of edges) {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    if (!incoming.has(e.target)) incoming.set(e.target, []);
    outgoing.get(e.source).push(e);
    incoming.get(e.target).push(e);
  }

  // Derived from the curated data, not hand-enumerated: stays correct
  // when project categories change in src/projects.ts.
  const categories = [...new Set(projects.map((p) => p.category || 'Other'))];
  const scope = categories.join(', ');

  // ---------------- llms.txt (token-lean index; mirrors the hub) ----------------
  const llms = [];
  llms.push(`# ${site.name}`, '');
  llms.push(`> ${site.description} ${audience}`, '');
  llms.push(
    fmt(templates.intro, {
      name: site.name,
      author: site.author,
      baseUrl,
      blogPath,
      scope,
      contactEmail: site.contactEmail,
    }),
    '',
  );
  llms.push(`## ${headings.main}`, '');
  llms.push(
    `- [${site.name} home](${baseUrl}): ${blurbs.home}`,
    `- [Blog](${blogPath}): ${blurbs.blog}`,
    `- [All posts](${postsUrl}): ${blurbs.posts}`,
    '',
  );
  llms.push(`## ${headings.projects}`, '');
  for (const p of projects) {
    llms.push(`- [${p.name}](${p.repoUrl}): ${p.description}`);
  }
  llms.push('', `## ${headings.profiles}`, '');
  llms.push(
    `- [GitHub Research](https://github.com/${site.personalUsername}): ${blurbs.research}`,
    `- [GitHub Studio](https://github.com/${site.organizationUsername}): ${blurbs.studio}`,
    `- [crates.io](https://crates.io/users/${site.personalCrateUser}?sort=downloads): ${blurbs.crates}`,
    '',
  );
  llms.push(`## ${headings.optional}`, '');
  llms.push(
    `- [Activity RSS](${blogPath}/activity.xml): ${blurbs.rss}`,
    `- [Activity Atom](${blogPath}/activity.atom): ${blurbs.atom}`,
    `- [Activity JSON](${blogPath}/activity.json): ${blurbs.json}`,
    `- [Full portfolio content](${baseUrl}/llms-full.txt): ${blurbs.full}`,
    `- [Contact](mailto:${site.contactEmail}): ${blurbs.contact}`,
    '',
  );

  // ---------------- llms-full.txt (complete variant) ----------------
  const full = [];
  full.push(`# ${site.name}`, '');
  full.push(`> ${site.description} ${audience}`, '');
  const graphNote = graph
    ? fmt(templates.graphNote, {
        schemaVersion: String(graph.schema_version),
        generatedAt: graph.generated_at,
      })
    : templates.graphOffline;
  full.push(
    fmt(templates.fullIntro, {
      name: site.name,
      author: site.author,
      baseUrl,
      blogPath,
      graphNote,
    }),
    '',
  );
  full.push(`## ${headings.main}`, '');
  full.push(
    `- [${site.name} home](${baseUrl}): ${blurbs.home}`,
    `- [Blog](${blogPath}): ${blurbs.blog}`,
    `- [All posts](${postsUrl}): ${blurbs.posts}`,
    '',
  );
  for (const cat of categories) {
    full.push(`## ${cat}`, '');
    for (const p of projects.filter((x) => (x.category || 'Other') === cat)) {
      full.push(`- [${p.name}](${p.repoUrl}): ${p.description}`);
      const node = nodes.get(repoId(p.repoUrl));
      if (p.languages.length) full.push(`  - ${labels.languages}: ${p.languages.join(', ')}`);
      if (p.technologies.length)
        full.push(`  - ${labels.stack}: ${p.technologies.join(', ')}`);
      for (const c of p.crates) full.push(`  - ${labels.crate}: https://crates.io/crates/${c}`);
      if (node) {
        if (node.homepage && !node.homepage.includes('crates.io')) {
          full.push(`  - ${labels.docs}: ${node.homepage}`);
        }
        if (node.topics?.length) full.push(`  - ${labels.topics}: ${node.topics.join(', ')}`);
        if (node.license) full.push(`  - ${labels.license}: ${node.license}`);
        if (node.layer?.length) full.push(`  - ${labels.layer}: ${node.layer.join('+')}`);
      }
      const out = outgoing.get(repoId(p.repoUrl)) ?? [];
      const inc = incoming.get(repoId(p.repoUrl)) ?? [];
      if (out.length) full.push(`  - ${labels.connectsTo}: ${edgeList(out, (e) => e.target)}`);
      if (inc.length) full.push(`  - ${labels.usedBy}: ${edgeList(inc, (e) => e.source)}`);
    }
    full.push('');
  }
  if (extra.length > 0) {
    full.push(`## ${headings.more}`, '');
    for (const n of extra) {
      const url = `https://github.com/${n.id}`;
      full.push(`- [${n.name}](${url}): ${n.description || blurbs.noDescription}`);
      if (n.language) full.push(`  - ${labels.language}: ${n.language}`);
      if (n.homepage) full.push(`  - ${labels.homepage}: ${n.homepage}`);
      if (n.topics?.length) full.push(`  - ${labels.topics}: ${n.topics.join(', ')}`);
      if (n.license) full.push(`  - ${labels.license}: ${n.license}`);
      if (n.layer?.length) full.push(`  - ${labels.layer}: ${n.layer.join('+')}`);
      const out = outgoing.get(n.id) ?? [];
      const inc = incoming.get(n.id) ?? [];
      if (out.length) full.push(`  - ${labels.connectsTo}: ${edgeList(out, (e) => e.target)}`);
      if (inc.length) full.push(`  - ${labels.usedBy}: ${edgeList(inc, (e) => e.source)}`);
    }
    full.push('');
  }
  full.push(`## ${headings.profiles}`, '');
  full.push(
    `- [GitHub Research](https://github.com/${site.personalUsername}): ${blurbs.research}`,
    `- [GitHub Studio](https://github.com/${site.organizationUsername}): ${blurbs.studio}`,
    `- [crates.io](https://crates.io/users/${site.personalCrateUser}?sort=downloads): ${blurbs.crates}`,
    `- [Contact](mailto:${site.contactEmail}): ${blurbs.contact}`,
    '',
  );

  writeFileSync(LLMS_PATH, llms.join('\n'));
  writeFileSync(FULL_PATH, full.join('\n'));
  console.log(
    `[llms] wrote llms.txt (${projects.length} curated) and llms-full.txt (${categories.length} categories${graph ? `, ${extra.length} extra visible, ${edges.length} edges` : ', graph unreachable'})`,
  );
}

// CLI entry: `node scripts/generate-llms.mjs`. No-op when imported.
if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  generateLlms().catch((err) => {
    console.error(`[llms] ${err.message}`);
    process.exit(1);
  });
}
