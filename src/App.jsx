import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/common/Header'
import FloatingContactButtons from './components/common/FloatingContactButtons'
import SiteFooter from './components/common/SiteFooterFixed'
import ScrollToTop from './components/common/ScrollToTop'
import PendingPaymentPopup from './components/common/PendingPaymentPopup'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import AboutPage from './pages/AboutPage'
import MyOrders from './pages/MyOrders'
import CheckoutPage from './pages/CheckoutPage'
import './styles/main.scss'
import './styles/theme.scss'

function AppLayout({ theme, onToggleTheme }) {
  const location = useLocation()
  const isCheckout = location.pathname === '/checkout'

  return (
    <div className="App">
      <ScrollToTop />
      <PendingPaymentPopup />
      {!isCheckout && <Header theme={theme} onToggleTheme={onToggleTheme} />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
      <FloatingContactButtons />
      <SiteFooter />
    </div>
  )
}

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
      <AppLayout theme={theme} onToggleTheme={handleToggleTheme} />
    </Router>
  )
}

export default App
