import { useEffect } from 'react'
import useStore from './store/useStore'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ExportModal from './components/ExportModal'

// Pages
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import UploadDataPage from './pages/UploadDataPage'
import AIInsightsPage from './pages/AIInsightsPage'
import ReportsPage from './pages/ReportsPage'


function App() {
  const { currentPage, darkMode, setDarkMode } = useStore()

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode))
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }
  }, [setDarkMode])

  // Update document class when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Render landing page separately (no sidebar/header)
  if (currentPage === 'landing') {
    return <LandingPage />
  }

  // Render current page component
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'upload':
        return <UploadDataPage />
      case 'insights':
        return <AIInsightsPage />
      case 'reports':
        return <ReportsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-6">
          {renderPage()}
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal />
    </div>
  )
}

export default App
