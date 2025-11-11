import { appConfig } from '../config/appConfig'

/**
 * Returns the base URL without trailing slash for path construction
 */
export function getBaseUrl(): string {
  const { baseUrl } = appConfig.site
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

/**
 * Returns the base URL with trailing slash for canonical/og:url usage
 */
export function getCanonicalUrl(): string {
  return `${getBaseUrl()}/`
}

/**
 * Converts a potentially relative URL to absolute using the site's base URL
 */
export function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${getBaseUrl()}${url}`
}
