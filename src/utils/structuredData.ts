import { projects } from '../projects'
import { appConfig } from '../config/appConfig'

export function generateStructuredData() {
  const { site, github, social, crates } = appConfig
  const baseUrl = site.baseUrl.replace(/\/$/, '')
  const logoUrl = `${baseUrl}/assets/zenOSmosis-logo-oNQJHx0N.svg`
  const authorId = `${baseUrl}/${site.authorSlug}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': baseUrl,
        name: site.name,
        url: `${baseUrl}/`,
        logo: logoUrl,
        sameAs: [
          `https://github.com/${github.username}`,
          `https://www.linkedin.com/in/${social.linkedinSlug}`,
          `https://crates.io/users/${crates.username}`,
          site.blogPath,
        ],
        founder: { '@id': authorId },
        owns: projects.map((project) => ({
          '@id': project.bookUrl,
        })),
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: site.contactPhone,
          email: site.contactEmail,
          contactType: 'Customer Service',
        },
      },
      {
        '@type': 'Person',
        '@id': authorId,
        name: site.author,
        url: `${baseUrl}/`,
        jobTitle: 'Software Engineer',
        sameAs: [
          `https://github.com/${github.username}`,
          `https://www.linkedin.com/in/${social.linkedinSlug}`,
          `https://crates.io/users/${crates.username}`,
          site.blogPath,
        ],
        knowsAbout: Array.from(
          new Set(projects.flatMap((p) => p.technologies))
        ),
      },
      ...projects.map((project) => ({
        '@type': 'SoftwareSourceCode',
        '@id': project.bookUrl,
        name: project.name,
        description: project.description,
        url: project.bookUrl,
        programmingLanguage: project.technologies,
        author: { '@id': authorId },
        sourceOrganization: { '@id': baseUrl },
      })),
    ],
  }
}
