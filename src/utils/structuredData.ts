import { projects } from '../projects'
import { appConfig } from '../config/appConfig'
import { getBaseUrl, toAbsoluteUrl } from './urlHelpers'
import logoPath from '../assets/zenOSmosis-logo.svg'

export function generateStructuredData() {
  const { site, github, crates } = appConfig
  const baseUrl = getBaseUrl()
  const logoUrl = toAbsoluteUrl(logoPath)
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
        author: { '@id': authorId },
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
        author: { '@id': authorId },
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
      // Organization node — mirrors blog llms.txt `Elsewhere`:
      // professional site + professional work (org GitHub) only.
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
          ...(github.organizationUsername
            ? [`https://github.com/${github.organizationUsername}`]
            : []),
        ],
        founder: { '@id': authorId },
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
      // Person node — mirrors blog llms.txt `Author: [jzombie](personal URL)`
      // url stays local (canonical on owned domain); externals live in sameAs only.
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
          '@id': `https://github.com/${github.personalUsername}.png`,
          url: `https://github.com/${github.personalUsername}.png`,
        },
        sameAs: [
          `https://github.com/${github.personalUsername}`,
          `https://crates.io/users/${crates.personalUsername}`,
        ],
        knowsAbout: Array.from(
          new Set(
            projects.flatMap((p) => [...p.languages, ...p.technologies])
          )
        ),
        knowsLanguage: site.languages,
      },
      // Blog node — mirrors blog llms.txt `Site:` + `Elsewhere` split:
      // blog is its own Site authored by the Person, published by the org,
      // not sameAs of either entity.
      {
        '@type': 'Blog',
        '@id': `${site.blogPath}/#blog`,
        url: `${site.blogPath}/`,
        name: 'zenOSmosis blog',
        author: { '@id': authorId },
        publisher: { '@id': organizationId },
        inLanguage: site.languages,
      },
      // SoftwareSourceCode nodes — mirrors blog `GitHub personal: personal projects`.
      // Repos live under jzombie/, so author/maintainer is the Person only.
      ...projects.map((project) => {
        const keywords = Array.from(
          new Set([...project.languages, ...project.technologies])
        )
        const crateUrls = (project.crates ?? []).map(
          (crate) => `https://crates.io/crates/${crate}`
        )

        return {
          '@type': 'SoftwareSourceCode',
          '@id': `${baseUrl}/#software-${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: project.name,
          description: project.description,
          url: project.repoUrl,
          codeRepository: project.repoUrl,
          ...(crateUrls.length > 0 ? { sameAs: crateUrls } : {}),
          ...(project.languages.length > 0
            ? { programmingLanguage: project.languages }
            : {}),
          ...(keywords.length > 0 ? { keywords } : {}),
          author: { '@id': authorId },
          maintainer: { '@id': authorId },
          isPartOf: { '@id': websiteId },
          inLanguage: site.languages,
        }
      }),
    ],
  }
}
