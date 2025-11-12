import { appConfig, cratesUrl, githubOrgUrl, githubUrl, linkedInUrl } from '../config/appConfig';
import logoUrl from '../assets/zenOSmosis-logo.svg';
import { GitHubMark, CratesMark, LinkedInMark } from './icons/BrandIcons';
import { LinkOut } from './LinkOut';
import './Footer.css';

const year = new Date().getFullYear();

export function SiteFooter() {
  const { site } = appConfig;
  const blogUrl = site.blogPath.startsWith('http')
    ? site.blogPath
    : `${site.baseUrl.replace(/\/$/, '')}/${site.blogPath.replace(/^\//, '')}`;
  const phoneHref = `tel:${site.contactPhone.replace(/[^\d+]/g, '')}`;

  return (
    <footer className="site-footer" id="contact-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logoUrl} alt={site.name} className="footer-logo" />
          <h2 className="footer-headline">Software for curious minds.</h2>
          <p className="footer-description">
            Thoughtful engineering, open toolmaking, and generous documentation to help indie developers build at a sustainable pace.
          </p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Explore</h4>
            <LinkOut className="footer-link" href={blogUrl} allowReferrer={true}>
              Blog
            </LinkOut>
          </div>

          <div className="footer-column">
            <h4>Profiles</h4>
            <LinkOut className="footer-link" href={githubUrl} allowReferrer={false}>
              <GitHubMark aria-hidden />
              GitHub · Research
            </LinkOut>
            <LinkOut className="footer-link" href={githubOrgUrl} allowReferrer={false}>
              <GitHubMark aria-hidden />
              GitHub · Studio
            </LinkOut>
            <LinkOut className="footer-link" href={cratesUrl} allowReferrer={false}>
              <CratesMark aria-hidden />
              crates.io
            </LinkOut>
          </div>

          <div className="footer-column" id="connect-column">
            <h4>Connect</h4>
            <LinkOut className="footer-link" href={linkedInUrl} allowReferrer={false}>
              <LinkedInMark aria-hidden />
              LinkedIn
            </LinkOut>
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
