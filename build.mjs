import { build } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function buildProduction() {
  console.log('Step 1: Building SSR bundle...');
  
  // First, build the SSR bundle
  await build({
    build: {
      ssr: true,
      outDir: 'dist-ssr',
      rollupOptions: {
        // Point the SSR build at the shared SSR entry module.
        input: './src/main-ssr.tsx',
      },
    },
  });
  
  console.log('Step 2: Building client bundle...');
  
  // Build the client
  await build({
    configFile: './vite.config.ts',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  });
  
  console.log('Step 3: Injecting React SSR content into production HTML...');
  
  // Import the SSR module and render
  // Import the freshly built SSR bundle and render the app to an HTML string.
  const { renderSSRToHTML, appConfig, generateStructuredData } = await import('./dist-ssr/main-ssr.js');
  
  // Read the built index.html
  const indexPath = join(__dirname, 'dist', 'index.html');
  let html = readFileSync(indexPath, 'utf-8');
  
  // Inject meta tags from appConfig
  const { site } = appConfig;
  const structuredData = generateStructuredData();
  const metaTags = `
    <title>${site.title}</title>
    <meta name="description" content="${site.description}" />
    <meta name="keywords" content="${site.keywords}" />
    <meta name="author" content="${site.author}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${site.baseUrl}" />
    <meta property="og:title" content="${site.title}" />
    <meta property="og:description" content="${site.description}" />
    <meta property="og:site_name" content="${site.name}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${site.baseUrl}" />
    <meta property="twitter:title" content="${site.title}" />
    <meta property="twitter:description" content="${site.description}" />
    <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
    </script>
  `;
  
  html = html.replace('</head>', `${metaTags}\n  </head>`);
  
  // Inject the SSR content
  const projectsHTML = renderSSRToHTML();
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${projectsHTML}</div>`
  );

  // Inline hashed CSS generated during the client build so styles work without JS
  const cssLinkRegex = /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g;
  let cssMatch;
  const inlineChunks = [];

  while ((cssMatch = cssLinkRegex.exec(html)) !== null) {
    const href = cssMatch[1];

    // Only inline the compiled asset CSS; leave other linked stylesheets alone
    if (!href.startsWith('/assets/')) {
      continue;
    }

    const cssFilePath = join(__dirname, 'dist', href.replace(/^\//, ''));
    if (!existsSync(cssFilePath)) {
      continue;
    }

    const cssContent = readFileSync(cssFilePath, 'utf-8');
    inlineChunks.push(cssContent);
    html = html.replace(cssMatch[0], '');
  }

  if (inlineChunks.length > 0) {
    const inlineTag = `<style data-ssr-inline>${inlineChunks.join('\n')}</style>`;
    html = html.replace('</head>', `  ${inlineTag}\n  </head>`);
  }
  
  // Write back the modified HTML
  writeFileSync(indexPath, html);
  
  console.log('✓ Production build complete with SSR content!');
}

buildProduction().catch(console.error);
