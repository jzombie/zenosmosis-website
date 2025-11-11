# zenOSmosis Website

A Vite + React SPA that powers the zenOSmosis digital garden and project hub.

## Development

- `npm install`
- `npm run dev`
- `npm run preview` – serve the production build locally
- `npm run build` – production build used by the deploy pipeline

### CSS while JavaScript is disabled

The custom dev SSR plugin (`injectSsrPlugin` in `vite.config.ts`) renders the app through `main-ssr.tsx` and injects `<link>` tags for every discovered stylesheet. As a result, the dev server remains fully styled even when you disable JavaScript in the browser, matching the production build experience.

If you need to double-check the production output, run `npm run build && npm run preview` and test the preview server with JS disabled.

### Project layout

- `src/App.tsx` – top-level layout (hero, project grid, sidebar) and CTA wiring
- `src/components` – UI modules and charts; shared utilities such as `LinkOut` live here
- `src/config/appConfig.ts` – single source of truth for profile metadata and external URLs
- `src/services` – data fetching adapters for GitHub and crates.io
- `src/utils/linking.ts` – centralised helpers for referrer-aware link generation

### Linking policy

Outbound links go through the `LinkOut` component so every call site explicitly declares whether to preserve the HTTP `Referer` header. Use `allowReferrer={true}` for your own properties (blog, GitHub profile, etc.) so SEO signals propagate, and `false` for third-party destinations that should not receive referrer data. Imperative openings inside the sidebar reuse the same policy via `openLink()` from the linking utility.

### SSR mirroring in dev

`vite.config.ts` registers a small dev-only plugin (`injectSsrPlugin`) that renders the app through `main-ssr.tsx` and walks the module graph with `collectCssUrls()`. This produces the same HTML/CSS shape that the production build emits, which is especially useful when previewing the site with JavaScript disabled.
