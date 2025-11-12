import { appConfig } from '../config/appConfig'
import { generateStructuredData } from './structuredData'
import { getCanonicalUrl, toAbsoluteUrl } from './urlHelpers'

/**
 * Build the shared SEO and social meta tags block so both the dev server and
 * production build inject identical markup without copy/paste drift.
 */
export function buildMetaTags(): string {
  const { site } = appConfig
  const canonicalUrl = getCanonicalUrl()
  const socialImageUrl = toAbsoluteUrl(site.socialImage)
  const structuredData = JSON.stringify(generateStructuredData(), null, 2)
  const indent = '    '

  return [
    `${indent}<link rel="canonical" href="${canonicalUrl}" />`,
    `${indent}<title>${site.title}</title>`,
    `${indent}<meta name="description" content="${site.description}" />`,
    `${indent}<meta name="keywords" content="${site.keywords}" />`,
    `${indent}<meta name="author" content="${site.author}" />`,
    `${indent}<meta property="og:type" content="website" />`,
    `${indent}<meta property="og:url" content="${canonicalUrl}" />`,
    `${indent}<meta property="og:title" content="${site.title}" />`,
    `${indent}<meta property="og:description" content="${site.description}" />`,
    `${indent}<meta property="og:site_name" content="${site.name}" />`,
    `${indent}<meta property="og:image" content="${socialImageUrl}" />`,
    `${indent}<meta property="og:image:width" content="1200" />`,
    `${indent}<meta property="og:image:height" content="630" />`,
    `${indent}<meta property="og:image:alt" content="${site.socialImageAlt}" />`,
    `${indent}<meta property="twitter:card" content="summary_large_image" />`,
    `${indent}<meta property="twitter:url" content="${canonicalUrl}" />`,
    `${indent}<meta property="twitter:title" content="${site.title}" />`,
    `${indent}<meta property="twitter:description" content="${site.description}" />`,
    `${indent}<meta property="twitter:image" content="${socialImageUrl}" />`,
    `${indent}<meta property="twitter:image:alt" content="${site.socialImageAlt}" />`,
    `${indent}<script type="application/ld+json">`,
    `${structuredData}`,
    `${indent}</script>`,
  ].join('\n')
}
