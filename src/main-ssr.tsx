/**
 * This file acts as the SSR entry point for the application.
 *
 * `build.mjs` and the dev-only SSR plugin both import this module
 * so they can call `renderProjectsToHTML()` and inject the rendered
 * markup into `index.html`. If you adapt this pattern in another
 * project, point your tooling to the equivalent file and export a
 * function that returns the rendered HTML string.
 */
import ReactDOMServer from 'react-dom/server'
import App from './App'

export function renderProjectsToHTML(): string {
  return ReactDOMServer.renderToString(<App />)
}
