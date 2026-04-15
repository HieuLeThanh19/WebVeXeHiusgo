import { useMemo, useState } from 'react'
import {
  FaArrowUp,
  FaCommentDots,
  FaFacebookMessenger,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from 'react-icons/fa'
import { SiZalo } from 'react-icons/si'
import { useLanguage } from '../../i18n/LanguageContext'
import '../../styles/floating-contact.scss'

function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const { t } = useLanguage()
  const contactActions = [
    {
      id: 'location',
      label: t('floating.location'),
      icon: FaMapMarkerAlt,
      accentClass: 'is-location',
    },
    {
      id: 'messenger',
      label: t('floating.messenger'),
      icon: FaFacebookMessenger,
      accentClass: 'is-messenger',
    },
    {
      id: 'zalo',
      label: t('floating.zalo'),
      icon: SiZalo,
      accentClass: 'is-zalo',
    },
    {
      id: 'phone',
      label: t('floating.phone'),
      icon: FaPhoneAlt,
      accentClass: 'is-phone',
    },
  ]

  const panelTitle = useMemo(() => {
    if (!activePanel) {
      return ''
    }

    return contactActions.find((action) => action.id === activePanel)?.label ?? ''
  }, [activePanel])

  const toggleMenu = () => {
    setIsExpanded((currentState) => {
      const nextState = !currentState

      if (!nextState) {
        setActivePanel(null)
      }

      return nextState
    })
  }

  const handleActionClick = (actionId) => {
    if (!isExpanded) {
      setIsExpanded(true)
    }

    setActivePanel((currentPanel) => (currentPanel === actionId ? null : actionId))
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className={`floating-contact${isExpanded ? ' is-expanded' : ''}`}>
      <div className="floating-contact__stack" aria-label={t('floating.quickContact')}>
        {contactActions.map((action, index) => {
          const Icon = action.icon
          const isActive = activePanel === action.id

          return (
            <div
              key={action.id}
              className={`floating-contact__item${isActive ? ' is-active' : ''}`}
              style={{ '--contact-index': contactActions.length - index }}
            >
              <div
                className={`floating-contact__panel${isActive ? ' is-visible' : ''}`}
                role="dialog"
                aria-hidden={!isActive}
              >
                <div className="floating-contact__panel-shell">
                  <span className="floating-contact__panel-kicker">{panelTitle || action.label}</span>
                  <div className="floating-contact__panel-body" />
                </div>
              </div>

              <button
                type="button"
                className={`floating-contact__action ${action.accentClass}${isActive ? ' is-selected' : ''}`}
                onClick={() => handleActionClick(action.id)}
                aria-label={action.label}
                aria-pressed={isActive}
              >
                <Icon />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          className="floating-contact__primary floating-contact__primary--chat"
          onClick={toggleMenu}
          aria-label={isExpanded ? t('floating.collapse') : t('floating.expand')}
          aria-expanded={isExpanded}
        >
          <FaCommentDots />
        </button>

        <button
          type="button"
          className="floating-contact__primary floating-contact__primary--top"
          onClick={scrollToTop}
          aria-label={t('floating.scrollTop')}
        >
          <FaArrowUp />
        </button>
      </div>
    </div>
  )
}

export default FloatingContactButtons
