import { build } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
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
        input: './src/entry-server.tsx',
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
  const { renderProjectsToHTML } = await import('./dist-ssr/entry-server.js');
  
  // Read the built index.html
  const indexPath = join(__dirname, 'dist', 'index.html');
  let html = readFileSync(indexPath, 'utf-8');
  
  // Inject the SSR content
  const projectsHTML = renderProjectsToHTML();
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${projectsHTML}</div>`
  );
  
  // Write back the modified HTML
  writeFileSync(indexPath, html);
  
  console.log('✓ Production build complete with SSR content!');
}

buildProduction().catch(console.error);
