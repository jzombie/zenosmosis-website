import { LogoBar } from './components/LogoBar'
import { ProjectGrid } from './components/ProjectGrid'
import { SidePanel } from './components/SidePanel'
import { ClientOnlyProvider, ClientOnly } from './contexts/ClientOnlyContext'
import { PersistentQueryProvider } from './contexts/PersistentQueryProvider'
import './App.css'
import './styles/liquid-background.css'

function App() {
  return (
    <ClientOnlyProvider>
      <PersistentQueryProvider>
        <LogoBar />
        <div className="app-layout">
          <main className="main-content">
            <section className="hero-intro">
              <h1 className="hero-title">Open-source craft for engineers who care about the details.</h1>
              <p className="hero-subtitle">Ideas, experiments, and production-ready tools built in the open.</p>
            </section>
            <ProjectGrid />
          </main>
          <ClientOnly>
            <SidePanel />
          </ClientOnly>
        </div>
      </PersistentQueryProvider>
    </ClientOnlyProvider>
  )
}

export default App
