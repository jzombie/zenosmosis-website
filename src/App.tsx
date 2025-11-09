import { LogoBar } from './components/LogoBar'
import { ProjectGrid } from './components/ProjectGrid'
import { SidePanel } from './components/SidePanel'
import { ClientOnlyProvider, ClientOnly } from './contexts/ClientOnlyContext'
import './App.css'

function App() {
  return (
    <ClientOnlyProvider>
      <LogoBar />
      <div className="app-layout">
        <main className="main-content">
          <ProjectGrid />
        </main>
        <ClientOnly>
          <SidePanel />
        </ClientOnly>
      </div>
    </ClientOnlyProvider>
  )
}

export default App
