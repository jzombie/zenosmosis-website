/**
 * This file acts as the SSR entry point for the application.
 *
 * `build.mjs` and the dev-only SSR plugin both import this module
 * so they can call `renderSSRToHTML()` and inject the rendered
 * markup into `index.html`. If you adapt this pattern in another
 * project, point your tooling to the equivalent file and export a
 * function that returns the rendered HTML string.
 */
import ReactDOMServer from 'react-dom/server'
import App from './App'
import './index.css'
import { appConfig } from './config/appConfig'
import { generateStructuredData } from './utils/structuredData'
import { getBaseUrl, getCanonicalUrl, toAbsoluteUrl } from './utils/urlHelpers'
import { buildMetaTags } from './utils/metaTags'

export function renderSSRToHTML(): string {
  return ReactDOMServer.renderToString(<App />)
}

export {
  appConfig,
  generateStructuredData,
  getBaseUrl,
  getCanonicalUrl,
  toAbsoluteUrl,
  buildMetaTags,
}
