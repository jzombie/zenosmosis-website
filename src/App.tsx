import type { MouseEvent } from 'react'
import { LogoBar } from './components/LogoBar'
import { ProjectGrid } from './components/ProjectGrid'
import { SidePanel } from './components/SidePanel'
import { ClientOnlyProvider, ClientOnly } from './contexts/ClientOnlyContext'
import { PersistentQueryProvider } from './contexts/PersistentQueryProvider'
import { SiteFooter } from './components/Footer'
import { LinkOut } from './components/LinkOut'
import { githubOrgUrl, linkedInUrl, appConfig } from './config/appConfig'
import './App.css'
import './styles/liquid-background.css'

function App() {
  const { site } = appConfig


  const handlePrimaryCtaClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const connectColumn = document.getElementById('connect-column')
    if (connectColumn) {
      connectColumn.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      setTimeout(() => {
        connectColumn.classList.add('highlight-connect')
        
        let ignoreScrollUntil = Date.now() + 3000
        
        const onScroll = () => {
          if (Date.now() < ignoreScrollUntil) {
            return
          }
          connectColumn.classList.remove('highlight-connect')
          window.removeEventListener('scroll', onScroll)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
      }, 800)
    } else {
      window.location.href = `mailto:${site.contactEmail}`
    }
  }

  return (
    <ClientOnlyProvider>
      <PersistentQueryProvider>
        <LogoBar />
        <div className="app-layout">
          <main className="main-content">
            <section className="hero-intro">
              <h1 className="hero-title">Open-source craft for engineers who care about the details.</h1>
              <p className="hero-subtitle">Closed-source, contract, and full-time work available for discussion.</p>
              <div className="hero-cta">
                <a
                  className="hero-cta-primary"
                  href={linkedInUrl}
                  onClick={handlePrimaryCtaClick}
                >
                  Let's Connect
                </a>
                <LinkOut
                  className="hero-cta-secondary"
                  href={githubOrgUrl}
                  allowReferrer={true}
                >
                  Learn More
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
