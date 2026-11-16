/**
 * Build-time generator for public/llms.txt and public/llms-full.txt.
 *
 * Backbone is OUR OWN internal data representation — the same modules that
 * drive the site and the JSON-LD @graph in src/utils/structuredData.ts:
 *   1. src/config/appConfig.ts — site header, URLs, contact
 *   2. src/projects.ts          — curated hub projects, in hub order
 * (Parsed as text rather than imported: this runs as plain node inside
 * build.mjs, before the Vite/TS pipeline exists.)
 *
 * Spliced in at build time per the portfolio graph
 * (https://github.com/jzombie/jzombie-graph, data/portfolio-graph.json):
 *   - Curated projects keep their hand-written descriptions (presentation copy wins).
 *   - The graph contributes topics, docs/crates homepage links, license, layer,
 *     and per-project dependency relations ("connects to" / "used by").
 *   - Graph-visible repos NOT in the curated list appear only in llms-full.txt,
 *     so llms.txt stays token-lean and mirrors the human hub 1:1.
 *
 * Offline safety: if the fetch fails, warn and generate from internal data only.
 *
 * llms.txt      — token-lean index. Mirrors the human hub 1:1.
 * llms-full.txt — complete variant. Full per-project detail, grouped by category.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GRAPH_URL =
  'https://raw.githubusercontent.com/jzombie/jzombie-graph/refs/heads/main/data/portfolio-graph.json';

const LLMS_PATH = join(ROOT, 'public', 'llms.txt');
const FULL_PATH = join(ROOT, 'public', 'llms-full.txt');

function strField(block, key) {
  const m = block.match(new RegExp(key + `\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'`, 's'));
  return m ? m[1] : '';
}

function arrField(block, key) {
  const m = block.match(new RegExp(key + '\\s*:\\s*\\[([^\\]]*)\\]', 's'));
  if (!m) return [];
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]);
}

/** Split the top-level object literals of a `[...] = [...]` array in a .ts source file. */
function parseTsArray(source, constName) {
  const anchor = source.indexOf(constName);
  const eq = source.indexOf('=', anchor);
  const start = source.indexOf('[', eq);
  let depth = 0;
  let current = '';
  const blocks = [];
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === '[' || ch === '{') depth++;
    if (depth === 2 && ch === '{') current = '{';
    else if (depth >= 2) current += ch;
    if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 1 && ch === '}' && current) {
        blocks.push(current);
        current = '';
      }
      if (depth === 0) break;
    }
  }
  return blocks;
}

function loadLocal() {
  const projectsSrc = readFileSync(join(ROOT, 'src', 'projects.ts'), 'utf-8');
  const configSrc = readFileSync(join(ROOT, 'src', 'config', 'appConfig.ts'), 'utf-8');

  // No silent hardcoded fallbacks: if a required field can't be parsed,
  // fail the build loudly instead of emitting stale copy.
  const required = (re, label) => {
    const m = configSrc.match(re);
    if (!m) throw new Error(`could not parse ${label} from src/config/appConfig.ts`);
    return m[1];
  };

  const projects = parseTsArray(projectsSrc, 'projects').map((b) => ({
    name: strField(b, 'name'),
    repoUrl: strField(b, 'repoUrl'),
    description: strField(b, 'description'),
    category: strField(b, 'category'),
    languages: arrField(b, 'languages'),
    technologies: arrField(b, 'technologies'),
    crates: arrField(b, 'crates'),
  }));

  const site = {
    name: required(/site:\s*\{\s*name:\s*'([^']+)'/, 'site name'),
    baseUrl: required(/baseUrl:\s*'([^']+)'/, 'baseUrl'),
    blogPath: required(/blogPath:\s*'([^']+)'/, 'blogPath'),
    contactEmail: required(/contactEmail:\s*'([^']+)'/, 'contactEmail'),
    description: required(/description:\s*\n?\s*'([^']+)'/, 'site description'),
    author: required(/author:\s*'([^']+)'/, 'author'),
    personalUsername: required(/personalUsername:\s*'([^']+)'/, 'personal GitHub username'),
    organizationUsername: required(
      /organizationUsername:\s*'([^']+)'/,
      'organization GitHub username',
    ),
    personalCrateUser: required(
      /crates:\s*\{[^}]*personalUsername:\s*'([^']+)'/,
      'crates.io username',
    ),
  };
  return { projects, site };
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

async function main() {
  const { projects, site } = loadLocal();
  if (projects.length === 0) throw new Error('parsed 0 projects from src/projects.ts');
  const { baseUrl, blogPath } = site;
  const postsUrl = `${blogPath.replace(/\/$/, '')}/posts`;

  let graph = null;
  try {
    graph = await loadGraph();
  } catch (err) {
    if (existsSync(LLMS_PATH) && existsSync(FULL_PATH)) {
      console.warn(`[llms] graph fetch failed (${err.message}); keeping existing files.`);
      return;
    }
    throw new Error(`graph fetch failed and no existing files: ${err.message}`);
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
  const scope = `across ${categories.join(', ')}`;

  // ---------------- llms.txt (token-lean index; mirrors the hub) ----------------
  const llms = [];
  llms.push(`# ${site.name}`, '');
  llms.push(
    `> ${site.description} Built for systems engineers and curious builders.`,
    '',
  );
  llms.push(
    `${site.name} is ${site.author}'s open-source studio and project hub at ${baseUrl}, with long-form notes at ${blogPath}. The hub lists actively maintained systems ${scope}. Contact: ${site.contactEmail}.`,
    '',
  );
  llms.push('## Main', '');
  llms.push(
    `- [${site.name} home](${baseUrl}): Project hub, hero intro, and live GitHub and crates.io activity.`,
    `- [Blog](${blogPath}): Long-form engineering notes, systems design, and Magnet Vector essays.`,
    `- [All posts](${postsUrl}): Full post index for the garden and notes.`,
    '',
  );
  llms.push('## Projects', '');
  for (const p of projects) {
    llms.push(`- [${p.name}](${p.repoUrl}): ${p.description}`);
  }
  llms.push('', '## Profiles', '');
  llms.push(
    `- [GitHub Research](https://github.com/${site.personalUsername}): Personal repositories, systems experiments, and research prototypes.`,
    `- [GitHub Studio](https://github.com/${site.organizationUsername}): Studio organization and cohesive system pieces.`,
    `- [crates.io](https://crates.io/users/${site.personalCrateUser}?sort=downloads): Published Rust crates by download count.`,
    '',
  );
  llms.push('## Optional', '');
  llms.push(
    `- [Activity RSS](${blogPath}/activity.xml): Blog activity feed in RSS format.`,
    `- [Activity Atom](${blogPath}/activity.atom): Blog activity feed in Atom format.`,
    `- [Activity JSON](${blogPath}/activity.json): Blog activity feed in JSON format.`,
    `- [Full portfolio content](${baseUrl}/llms-full.txt): Complete version of this index with full per-project detail by category.`,
    `- [Contact](mailto:${site.contactEmail}): Email the studio for questions or collaboration.`,
    '',
  );

  // ---------------- llms-full.txt (complete variant) ----------------
  const full = [];
  full.push(`# ${site.name}`, '');
  full.push(
    `> ${site.description} Built for systems engineers and curious builders.`,
    '',
  );
  full.push(
    `${site.name} is ${site.author}'s open-source studio and project hub at ${baseUrl}, with long-form notes at ${blogPath}. This is the complete version of ${baseUrl}/llms.txt, generated at build time from the site's own data (src/projects.ts, src/config/appConfig.ts) — the same sources behind the homepage and its JSON-LD graph${graph ? ` — spliced with portfolio-graph.json schema v${graph.schema_version}, generated ${graph.generated_at}` : ' (portfolio graph unreachable at build time; internal data only)'}.`,
    '',
  );
  full.push('## Main', '');
  full.push(
    `- [${site.name} home](${baseUrl}): Project hub, hero intro, and live GitHub and crates.io activity.`,
    `- [Blog](${blogPath}): Long-form engineering notes, systems design, and Magnet Vector essays.`,
    `- [All posts](${postsUrl}): Full post index for the garden and notes.`,
    '',
  );
  for (const cat of categories) {
    full.push(`## ${cat}`, '');
    for (const p of projects.filter((x) => (x.category || 'Other') === cat)) {
      full.push(`- [${p.name}](${p.repoUrl}): ${p.description}`);
      const node = nodes.get(repoId(p.repoUrl));
      if (p.languages.length) full.push(`  - languages: ${p.languages.join(', ')}`);
      if (p.technologies.length)
        full.push(`  - stack: ${p.technologies.join(', ')}`);
      for (const c of p.crates) full.push(`  - crate: https://crates.io/crates/${c}`);
      if (node) {
        if (node.homepage && !node.homepage.includes('crates.io')) {
          full.push(`  - docs: ${node.homepage}`);
        }
        if (node.topics?.length) full.push(`  - topics: ${node.topics.join(', ')}`);
        if (node.license) full.push(`  - license: ${node.license}`);
        if (node.layer?.length) full.push(`  - layer: ${node.layer.join('+')}`);
      }
      const out = outgoing.get(repoId(p.repoUrl)) ?? [];
      const inc = incoming.get(repoId(p.repoUrl)) ?? [];
      if (out.length) full.push(`  - connects to: ${edgeList(out, (e) => e.target)}`);
      if (inc.length) full.push(`  - used by: ${edgeList(inc, (e) => e.source)}`);
    }
    full.push('');
  }
  if (extra.length > 0) {
    full.push('## More visible in the portfolio graph', '');
    for (const n of extra) {
      const url = `https://github.com/${n.id}`;
      full.push(`- [${n.name}](${url}): ${n.description || 'No description.'}`);
      if (n.language) full.push(`  - language: ${n.language}`);
      if (n.homepage) full.push(`  - homepage: ${n.homepage}`);
      if (n.topics?.length) full.push(`  - topics: ${n.topics.join(', ')}`);
      if (n.license) full.push(`  - license: ${n.license}`);
      if (n.layer?.length) full.push(`  - layer: ${n.layer.join('+')}`);
      const out = outgoing.get(n.id) ?? [];
      const inc = incoming.get(n.id) ?? [];
      if (out.length) full.push(`  - connects to: ${edgeList(out, (e) => e.target)}`);
      if (inc.length) full.push(`  - used by: ${edgeList(inc, (e) => e.source)}`);
    }
    full.push('');
  }
  full.push('## Profiles', '');
  full.push(
    `- [GitHub Research](https://github.com/${site.personalUsername}): Personal repositories, systems experiments, and research prototypes.`,
    `- [GitHub Studio](https://github.com/${site.organizationUsername}): Studio organization and cohesive system pieces.`,
    `- [crates.io](https://crates.io/users/${site.personalCrateUser}?sort=downloads): Published Rust crates by download count.`,
    `- [Contact](mailto:${site.contactEmail}): Email the studio for questions or collaboration.`,
    '',
  );

  writeFileSync(LLMS_PATH, llms.join('\n'));
  writeFileSync(FULL_PATH, full.join('\n'));
  console.log(
    `[llms] wrote llms.txt (${projects.length} curated) and llms-full.txt (${categories.length} categories${graph ? `, ${extra.length} extra visible, ${edges.length} edges` : ', graph unreachable'})`,
  );
}

main().catch((err) => {
  console.error(`[llms] ${err.message}`);
  process.exit(1);
});
