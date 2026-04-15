import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaBus, FaUser, FaBell, FaPhoneAlt } from 'react-icons/fa'
import AuthModal from './AuthModal'
import { useLanguage } from '../../i18n/LanguageContext'
import '../../styles/header.scss'

const Header = ({ theme, onToggleTheme }) => {
  const isDarkTheme = theme === 'dark'
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const { language, t, toggleLanguage } = useLanguage()

  const openLogin = () => {
    setAuthMode('login')
    setAuthOpen(true)
  }

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-top-content">
              <div className="header-contact">
                <FaPhoneAlt /> {t('header.hotline')}
              </div>
              <div className="header-links">
                <a href="#">{t('header.partner')}</a>
                <span className="divider">|</span>
                <a href="#">{t('header.downloadApp')}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="header-main">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                <FaBus className="logo-icon" />
                <span className="logo-text">HiusGo</span>
              </Link>

              <nav className="nav-menu">
                <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {t('header.home')}
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {t('header.about')}
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {t('header.contact')}
                </NavLink>
              </nav>

              <div className="header-actions">
                <button
                  className="btn-icon btn-language-toggle"
                  type="button"
                  onClick={toggleLanguage}
                  aria-label={t('header.switchLanguage')}
                  title={t('header.switchLanguage')}
                >
                  <span className={`flag-pill${language === 'vi' ? ' is-vi' : ' is-en'}`} aria-hidden="true">
                    <span className="flag-pill__flag">🇻🇳</span>
                    <span className="flag-pill__flag">🇬🇧</span>
                  </span>
                </button>
                <button
                  className="btn-icon btn-theme-toggle"
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={isDarkTheme ? t('header.themeToLight') : t('header.themeToDark')}
                  title={isDarkTheme ? t('header.themeToLight') : t('header.themeToDark')}
                >
                  <span aria-hidden="true">{isDarkTheme ? '🌙' : '☀️'}</span>
                </button>
                <button className="btn-icon" type="button" aria-label={t('header.notifications')}>
                  <FaBell />
                </button>
                <button className="btn-login" type="button" onClick={openLogin}>
                  <FaUser /> {t('header.login')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  )
}

export default Header
