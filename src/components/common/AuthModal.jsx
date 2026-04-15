import { useEffect, useState } from 'react'
import { FaTimes, FaPhoneAlt, FaGoogle } from 'react-icons/fa'
import { useLanguage } from '../../i18n/LanguageContext'
import '../../styles/auth.scss'

const COUNTRY_CODES = [
  { code: '+84', flag: 'VN', label: 'VN +84' },
  { code: '+1',  flag: 'US', label: 'US +1'  },
  { code: '+44', flag: 'GB', label: 'GB +44' },
  { code: '+81', flag: 'JP', label: 'JP +81' },
  { code: '+82', flag: 'KR', label: 'KR +82' },
]

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+84')
  const { t } = useLanguage()

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    setMode(defaultMode)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [defaultMode, isOpen, onClose])

  if (!isOpen) return null

  const isLogin = mode === 'login'

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: gắn logic xác thực thật ở đây
  }

  const handleGoogleLogin = () => {
    // TODO: gắn Google OAuth ở đây
  }

  return (
    <div className="auth-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-modal__header">
          <div className="auth-modal__logo">
            <span className="auth-modal__logo-dot" />
            HiusGo
          </div>
          <button
            className="auth-modal__close"
            type="button"
            onClick={onClose}
            aria-label={t('auth.close')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Title */}
        <div className="auth-modal__title-wrap">
          <h2 className="auth-modal__title">
            {isLogin ? t('auth.login') : t('auth.register')}
          </h2>
          <p className="auth-modal__subtitle">
            {isLogin
              ? t('auth.loginWelcome')
              : t('auth.registerWelcome')}
          </p>
        </div>

        {/* Form */}
        <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="auth-modal__field">
            <label className="auth-modal__label" htmlFor="auth-phone">
              <FaPhoneAlt className="auth-modal__label-icon" />
              {t('auth.phone')}
            </label>
            <div className="auth-modal__phone-row">
              <select
                className="auth-modal__country-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label={t('auth.countryCode')}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id="auth-phone"
                className="auth-modal__input"
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                inputMode="numeric"
              />
            </div>
          </div>

          <button className="auth-modal__btn-primary" type="submit">
            {isLogin ? t('auth.login') : t('auth.register')}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-modal__divider">
          <span>{t('auth.or')}</span>
        </div>

        {/* Google */}
        <button
          className="auth-modal__btn-google"
          type="button"
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="auth-modal__google-icon" />
          {t('auth.continueWithGoogle')}
        </button>

        {/* Switch mode */}
        <p className="auth-modal__switch">
          {isLogin ? (
            <>
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                className="auth-modal__switch-link"
                onClick={() => setMode('register')}
              >
                {t('auth.register')}
              </button>
            </>
          ) : (
            <>
              {t('auth.haveAccount')}{' '}
              <button
                type="button"
                className="auth-modal__switch-link"
                onClick={() => setMode('login')}
              >
                {t('auth.login')}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default AuthModal
