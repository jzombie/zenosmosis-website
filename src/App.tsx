import { LogoBar } from './components/LogoBar'
import { ProjectGrid } from './components/ProjectGrid'
import { SidePanel } from './components/SidePanel'
import { ClientOnlyProvider, ClientOnly } from './contexts/ClientOnlyContext'
import { PersistentQueryProvider } from './contexts/PersistentQueryProvider'
import { SiteFooter } from './components/Footer'
import { LinkOut } from './components/LinkOut'
import { appConfig, githubUrl } from './config/appConfig'
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
              <h1 className="hero-title">Open-source craft for engineers who care about the details.</h1>
              <p className="hero-subtitle">Ideas and experiments built in the open.</p>
              <div className="hero-cta">
                <a className="hero-cta-primary" href={`mailto:${site.contactEmail}`}>
                  Start a project
                </a>
                <LinkOut
                  className="hero-cta-secondary"
                  href={githubUrl}
                  allowReferrer={true}
                >
                  Explore
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
