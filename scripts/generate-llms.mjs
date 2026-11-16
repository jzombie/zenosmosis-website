/**
 * Build-time generator for public/llms.txt and public/llms-full.txt.
 *
 * Sources of truth:
 *   1. src/config/appConfig.ts  — site header, URLs, contact (parsed, not imported: this runs as plain node).
 *   2. src/projects.ts           — curated hub projects, in hub order (parsed, see above).
 *   3. portfolio-graph.json      — nightly jzombie-graph export (fetched live; spliced in by repo URL).
 *
 * Splice rules:
 *   - Curated projects keep their hand-written descriptions (presentation copy wins).
 *   - The graph contributes stars, topics, docs/crates homepage links, license, layer, pushed_at.
 *   - Graph-visible repos NOT in the curated list appear only in llms-full.txt ("More ..."),
 *     so llms.txt stays token-lean and mirrors the human hub 1:1.
 *   - Dependency edges where both ends are visible are listed in llms-full.txt.
 *
 * Offline safety: if the fetch fails and both output files already exist, warn and
 * keep the last-known-good files (exit 0). If they are missing, fail loudly.
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
  const start = source.indexOf('[', anchor);
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
    name: strField(configSrc, "name: 'zenOSmosis'") || 'zenOSmosis',
    baseUrl: configSrc.match(/baseUrl:\s*'([^']+)'/)?.[1] ?? 'https://zenosmosis.com',
    blogPath: configSrc.match(/blogPath:\s*'([^']+)'/)?.[1] ?? 'https://blog.zenosmosis.com',
    contactEmail:
      configSrc.match(/contactEmail:\s*'([^']+)'/)?.[1] ?? 'info@zenosmosis.com',
    title:
      configSrc.match(/title:\s*'([^']+)'/)?.[1] ??
      'zenOSmosis — Open-Source Systems That Fit Together',
    description:
      configSrc.match(/description:\s*\n?\s*'([^']+)'/)?.[1] ??
      'Open-source infrastructure, terminals, storage, and ML pipelines — reusable pieces of one cohesive system, built in the open.',
    author: configSrc.match(/author:\s*'([^']+)'/)?.[1] ?? 'Jeremy Harris',
    personalUsername:
      configSrc.match(/personalUsername:\s*'([^']+)'/)?.[1] ?? 'jzombie',
    organizationUsername:
      configSrc.match(/organizationUsername:\s*'([^']+)'/)?.[1] ?? 'zenOSmosis',
    personalCrateUser: configSrc.match(/crates:\s*\{[^}]*personalUsername:\s*'([^']+)'/)?.[1] ?? 'jzombie',
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

function starsSuffix(n) {
  return n > 0 ? ` (${n} star${n === 1 ? '' : 's'})` : '';
}

async function main() {
  const { projects, site } = loadLocal();
  if (projects.length === 0) throw new Error('parsed 0 projects from src/projects.ts');

  let graph = null;
  try {
    graph = await loadGraph();
  } catch (err) {
    if (existsSync(LLMS_PATH) && existsSync(FULL_PATH)) {
      console.warn(`[llms] fetch failed (${err.message}); keeping existing files.`);
      return;
    }
    throw new Error(`graph fetch failed and no existing files: ${err.message}`);
  }

  const nodes = new Map((graph.nodes ?? []).map((n) => [n.id, n]));
  const visible = (graph.nodes ?? []).filter((n) => n.visible);
  const curatedIds = new Set(projects.map((p) => repoId(p.repoUrl)));

  for (const p of projects) {
    if (!nodes.has(repoId(p.repoUrl))) {
      console.warn(`[llms] curated project has no graph node: ${p.repoUrl}`);
    }
  }

  const extra = visible
    .filter((n) => !curatedIds.has(n.id))
    .sort((a, b) => a.id.localeCompare(b.id));

  const visibleIds = new Set(visible.map((n) => n.id));
  const edges = (graph.edges ?? [])
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));

  const { baseUrl, blogPath } = site;

  // ---------------- llms.txt (token-lean index; mirrors the hub) ----------------
  const llms = [];
  llms.push(`# ${site.name}`, '');
  llms.push(
    `> ${site.description} Built for systems engineers and curious builders.`,
    '',
  );
  llms.push(
    `${site.name} is ${site.author}'s open-source studio and project hub at ${baseUrl}, with long-form notes at ${blogPath}. The hub lists actively maintained systems across infrastructure, virtualization, storage, developer tooling, AI/ML, and research pipelines. Contact: ${site.contactEmail}.`,
    '',
  );
  llms.push('## Main', '');
  llms.push(
    `- [${site.name} home](${baseUrl}): Project hub, hero intro, and live GitHub and crates.io activity.`,
    `- [Blog](${blogPath}): Long-form engineering notes, systems design, and Magnet Vector essays.`,
    `- [All posts](${blogPath.replace(/\/$/, '')}/posts): Full post index for the garden and notes.`,
    '',
  );
  llms.push('## Projects', '');
  for (const p of projects) {
    const node = nodes.get(repoId(p.repoUrl));
    llms.push(
      `- [${p.name}](${p.repoUrl}): ${p.description}${node ? starsSuffix(node.stars) : ''}`,
    );
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
    `- [Full portfolio content](${baseUrl}/llms-full.txt): Complete version of this index with all portfolio repos, topics, docs links, and dependency edges.`,
    `- [Contact](mailto:${site.contactEmail}): Email the studio for questions or collaboration.`,
    '',
  );

  // ---------------- llms-full.txt (complete version) ----------------
  const full = [];
  full.push(`# ${site.name}`, '');
  full.push(
    `> ${site.description} Built for systems engineers and curious builders.`,
    '',
  );
  full.push(
    `${site.name} is ${site.author}'s open-source studio and project hub at ${baseUrl}, with long-form notes at ${blogPath}.`,
    '',
    `Source: portfolio-graph.json schema v${graph.schema_version}, generated ${graph.generated_at}. Curated descriptions mirror the hub at ${baseUrl}; graph fields (stars, topics, docs, license, layer) are spliced in at build time.`,
    '',
  );
  full.push('## Curated projects', '');
  for (const p of projects) {
    const node = nodes.get(repoId(p.repoUrl));
    full.push(`- [${p.name}](${p.repoUrl}): ${p.description}`);
    const detail = [];
    if (p.languages.length) detail.push(`languages: ${p.languages.join(', ')}`);
    if (p.technologies.length) detail.push(`stack: ${p.technologies.join(', ')}`);
    for (const c of p.crates) detail.push(`crate: https://crates.io/crates/${c}`);
    if (node) {
      if (node.homepage && !node.homepage.includes('crates.io')) {
        detail.push(`docs: ${node.homepage}`);
      }
      if (node.topics?.length) detail.push(`topics: ${node.topics.join(', ')}`);
      if (node.stars > 0) detail.push(`stars: ${node.stars}`);
      if (node.license) detail.push(`license: ${node.license}`);
      if (node.layer?.length) detail.push(`layer: ${node.layer.join('+')}`);
    }
    for (const d of detail) full.push(`  - ${d}`);
  }
  full.push('', '## More visible in the portfolio graph', '');
  if (extra.length === 0) {
    full.push('None beyond the curated projects.');
  }
  for (const n of extra) {
    const url = `https://github.com/${n.id}`;
    full.push(`- [${n.name}](${url}): ${n.description || 'No description.'}`);
    const detail = [];
    if (n.language) detail.push(`language: ${n.language}`);
    if (n.homepage) detail.push(`homepage: ${n.homepage}`);
    if (n.topics?.length) detail.push(`topics: ${n.topics.join(', ')}`);
    if (n.stars > 0) detail.push(`stars: ${n.stars}`);
    if (n.license) detail.push(`license: ${n.license}`);
    if (n.layer?.length) detail.push(`layer: ${n.layer.join('+')}`);
    for (const d of detail) full.push(`  - ${d}`);
  }
  if (edges.length > 0) {
    full.push('', '## Dependency edges', '');
    for (const e of edges) {
      full.push(`- ${e.source} -> ${e.target} (${e.kind})`);
    }
  }
  full.push('', '## Profiles', '');
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
    `[llms] wrote llms.txt (${projects.length} curated) and llms-full.txt (${visible.length} visible, ${edges.length} edges) from graph generated ${graph.generated_at}`,
  );
}

main().catch((err) => {
  console.error(`[llms] ${err.message}`);
  process.exit(1);
});
