import { appConfig } from '../config/appConfig';
import logoUrl from '../assets/zenOSmosis-logo.svg';
import { GitHubMark, CratesMark, LinkedInMark } from './icons/BrandIcons';
import './Footer.css';

const year = new Date().getFullYear();

export function SiteFooter() {
  const { site, github, crates, social } = appConfig;
  const blogUrl = site.blogPath.startsWith('http')
    ? site.blogPath
    : `${site.baseUrl.replace(/\/$/, '')}/${site.blogPath.replace(/^\//, '')}`;
  const githubUrl = `https://github.com/${github.username}`;
  const cratesUrl = `https://crates.io/users/${crates.username}?sort=downloads`;
  const linkedinUrl = `https://www.linkedin.com/in/${social.linkedinSlug}`;
  const phoneHref = `tel:${site.contactPhone.replace(/[^\d+]/g, '')}`;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logoUrl} alt={site.name} className="footer-logo" />
          <h2 className="footer-headline">Crafting calm software for curious minds.</h2>
          <p className="footer-description">
            Thoughtful engineering, open toolmaking, and generous documentation to help indie developers build at a sustainable pace.
          </p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Explore</h4>
            <a className="footer-link" href={blogUrl} target="_blank" rel="noreferrer noopener">
              Blog
            </a>
          </div>

          <div className="footer-column">
            <h4>Profiles</h4>
            <a className="footer-link" href={githubUrl} target="_blank" rel="noreferrer noopener">
              <GitHubMark aria-hidden />
              GitHub
            </a>
            <a className="footer-link" href={cratesUrl} target="_blank" rel="noreferrer noopener">
              <CratesMark aria-hidden />
              crates.io
            </a>
          </div>

          <div className="footer-column">
            <h4>Connect</h4>
            <a className="footer-link" href={linkedinUrl} target="_blank" rel="noreferrer noopener">
              <LinkedInMark aria-hidden />
              LinkedIn
            </a>
            <a className="footer-link" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            <a className="footer-link" href={phoneHref}>
              {site.contactPhone}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-meta">
        <span>© {year} {site.name}. Built with curiosity and care.</span>
      </div>
    </footer>
  );
}
