import { projects } from '../projects'
import { appConfig } from '../config/appConfig'
import { getBaseUrl, toAbsoluteUrl } from './urlHelpers'

export function generateStructuredData() {
  const { site, github, social, crates } = appConfig
  const baseUrl = getBaseUrl()
  const logoUrl = `${baseUrl}/assets/zenOSmosis-logo-oNQJHx0N.svg`
  const socialImageUrl = toAbsoluteUrl(site.socialImage)
  const authorId = `${baseUrl}/#person`
  const organizationId = `${baseUrl}/#organization`
  const websiteId = `${baseUrl}/#website`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // WebSite node
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${baseUrl}/`,
        name: site.name,
        description: site.description,
        publisher: { '@id': organizationId },
        inLanguage: site.languages,
      },
      // WebPage node (main page)
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        url: `${baseUrl}/`,
        name: site.title,
        description: site.description,
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          '@id': `${socialImageUrl}#image`,
          url: socialImageUrl,
          width: 1200,
          height: 630,
          caption: site.socialImageAlt,
        },
        inLanguage: site.languages,
      },
      // Organization node
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: site.name,
        url: `${baseUrl}/`,
        description: site.organizationDescription,
        logo: {
          '@type': 'ImageObject',
          '@id': `${logoUrl}#logo`,
          url: logoUrl,
          caption: `${site.name} logo`,
        },
        image: {
          '@type': 'ImageObject',
          '@id': `${socialImageUrl}#image`,
          url: socialImageUrl,
          width: 1200,
          height: 630,
        },
        sameAs: [
          `https://github.com/${github.username}`,
          ...(github.orgUsername
            ? [`https://github.com/${github.orgUsername}`]
            : []),
          `https://www.linkedin.com/in/${social.linkedinSlug}`,
          `https://crates.io/users/${crates.username}`,
          site.blogPath,
        ],
        founder: { '@id': authorId },
        owns: projects.map((project) => ({
          '@id': `${project.bookUrl}#software`,
        })),
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: site.contactPhone,
          email: site.contactEmail,
          contactType: 'Customer Service',
          areaServed: site.areaServed,
          availableLanguage: site.languages,
        },
        foundingDate: site.foundingDate,
        areaServed: site.areaServed,
      },
      // Person node
      {
        '@type': 'Person',
        '@id': authorId,
        name: site.author,
        url: `${baseUrl}/`,
        jobTitle: site.authorJobTitle,
        description: site.authorDescription,
        worksFor: { '@id': organizationId },
        image: {
          '@type': 'ImageObject',
          '@id': `${socialImageUrl}#image`,
          url: socialImageUrl,
        },
        sameAs: [
          `https://github.com/${github.username}`,
          `https://www.linkedin.com/in/${social.linkedinSlug}`,
          `https://crates.io/users/${crates.username}`,
          site.blogPath,
        ],
        knowsAbout: Array.from(
          new Set(projects.flatMap((p) => p.technologies))
        ),
        knowsLanguage: site.languages,
      },
      // SoftwareSourceCode nodes
      ...projects.map((project) => ({
        '@type': 'SoftwareSourceCode',
        '@id': `${project.bookUrl}#software`,
        name: project.name,
        description: project.description,
        url: project.bookUrl,
        programmingLanguage: project.technologies,
        author: { '@id': authorId },
        sourceOrganization: { '@id': organizationId },
        maintainer: { '@id': authorId },
        isPartOf: { '@id': websiteId },
        inLanguage: site.languages,
      })),
    ],
  }
}
