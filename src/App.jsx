import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import FloatingContactButtons from './components/common/FloatingContactButtons'
import SiteFooter from './components/common/SiteFooterFixed'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import AboutPage from './pages/AboutPage'
import MyOrders from './pages/MyOrders'
import './styles/main.scss'
import './styles/theme.scss'

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const storedTheme = window.localStorage.getItem('hiusgo-theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    window.localStorage.setItem('hiusgo-theme', theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <Router>
      <div className="App">
        <Header theme={theme} onToggleTheme={handleToggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
        </main>
        <FloatingContactButtons />
        <SiteFooter />
      </div>
    </Router>
  )
}

export default App
