import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
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
      
      return html.replace(
        '<div id="root"></div>',
        `<div id="root">${projectsHTML}</div>`
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), injectProjectsPlugin()],
})
