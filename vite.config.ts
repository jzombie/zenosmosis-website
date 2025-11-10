import { defineConfig } from 'vite'
import type { ModuleNode, Plugin, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

function injectProjectsPlugin(): Plugin {
  let viteServer: ViteDevServer | undefined;
  
  return {
    name: 'inject-projects',
    configureServer(server) {
      viteServer = server;
    },
    async transformIndexHtml(html) {
      // Only do SSR rendering in dev mode
      // In production, the build.mjs script handles SSR injection
      if (!viteServer) {
        return html; // Skip in production build
      }
      
      const { renderProjectsToHTML } = await viteServer.ssrLoadModule('/src/entry-server.tsx');
      const projectsHTML = renderProjectsToHTML();

      const transformedHtml = html.replace(
        '<div id="root"></div>',
        `<div id="root">${projectsHTML}</div>`
      );

      const entryModule = await viteServer.moduleGraph.getModuleByUrl('/src/entry-server.tsx');
      const cssUrls = collectCssUrls(entryModule);

      if (!cssUrls.length) {
        return transformedHtml;
      }

      const cssMarkup = cssUrls
        .map((href) => `<link rel="stylesheet" href="${href}">`)
        .join('\n    ');

      return transformedHtml.replace('</head>', `    ${cssMarkup}\n  </head>`);
    },
  };
}

function collectCssUrls(moduleNode: ModuleNode | undefined, seen = new Set<ModuleNode>()): string[] {
  if (!moduleNode) {
    return [];
  }

  const collected = new Set<string>();

  const walk = (node: ModuleNode | undefined) => {
    if (!node || seen.has(node)) {
      return;
    }
    seen.add(node);

    const isCssModule = Boolean(node.url && /\.css($|\?)/.test(node.url));

    if (node.url && (node.type === 'css' || isCssModule)) {
      collected.add(node.url);
    }

    const deps = new Set<ModuleNode>();
    if (node.ssrImportedModules) {
      for (const dep of node.ssrImportedModules) {
        deps.add(dep);
      }
    }
    for (const dep of node.importedModules) {
      deps.add(dep);
    }

    for (const dep of deps) {
      walk(dep);
    }
  };

  walk(moduleNode);

  return Array.from(collected);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), injectProjectsPlugin()],
})
