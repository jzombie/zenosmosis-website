import { LogoBar } from './components/LogoBar'
import { ProjectGrid } from './components/ProjectGrid'
import { SidePanel } from './components/SidePanel'
import { ClientOnlyProvider, ClientOnly } from './contexts/ClientOnlyContext'
import { PersistentQueryProvider } from './contexts/PersistentQueryProvider'
import { SiteFooter } from './components/Footer'
import { LinkOut } from './components/LinkOut'
import { ScrollCta } from './components/ScrollCta'
import { appConfig, githubPersonalUrl } from './config/appConfig'
import './App.css'
import './styles/liquid-background.css'

function App() {
  const { site } = appConfig

  return (
    <ClientOnlyProvider>
      <PersistentQueryProvider>
        <LogoBar />
        <div className="app-layout">
          <main className="main-content">
            <section className="hero-intro">
              <h1 className="hero-title">Open-source systems that fit together.</h1>
              <p className="hero-subtitle">Infrastructure, terminal environments, storage engines, and research pipelines — reusable pieces of one cohesive stack.</p>
              <div className="hero-cta">
                <ScrollCta
                  className="hero-cta-primary"
                  targetId="connect-column"
                  fallbackHref={`mailto:${site.contactEmail}`}
                >
                  Contact
                </ScrollCta>
                <ScrollCta
                  className="hero-cta-secondary"
                  targetId="explore-columns"
                >
                  Explore
                </ScrollCta>
                <LinkOut
                  className="hero-cta-secondary"
                  href={site.blogPath}
                  allowReferrer={true}
                >
                  Learn More
                </LinkOut>
                <LinkOut
                  className="hero-cta-secondary"
                  href={`${site.blogPath.replace(/\/$/, '')}/posts`}
                  allowReferrer={true}
                >
                  Blog Posts
                </LinkOut>
                <LinkOut
                  className="hero-cta-secondary"
                  href={githubPersonalUrl}
                  allowReferrer={false}
                >
                  Software
                </LinkOut>
              </div>
            </section>
            <ProjectGrid />
          </main>
          <ClientOnly>
            <SidePanel />
          </ClientOnly>
        </div>
        <SiteFooter />
      </PersistentQueryProvider>
    </ClientOnlyProvider>
  )
}

export default App
