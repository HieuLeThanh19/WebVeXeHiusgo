import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FaArrowUp,
  FaCommentDots,
  FaExternalLinkAlt,
  FaFacebookMessenger,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from 'react-icons/fa'
import { SiZalo } from 'react-icons/si'
import { t } from '../../content/siteText'
import '../../styles/floating-contact.scss'

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/MrRChr1YtJhgKJDT6'

const LocationPanelContent = () => (
  <div className="floating-contact__location-content">
    <div className="floating-contact__location-preview" aria-hidden="true">
      <span className="floating-contact__location-pin">
        <FaMapMarkerAlt />
      </span>
      <span className="floating-contact__location-road floating-contact__location-road--one" />
      <span className="floating-contact__location-road floating-contact__location-road--two" />
    </div>

    <div className="floating-contact__location-info">
      <p className="floating-contact__location-name">ĐH Thủ Dầu Một - Văn phòng HiusGo</p>
      <p className="floating-contact__location-addr">6 Trần Văn Ơn, Phú Hòa, Thủ Dầu Một, Bình Dương</p>
      <p className="floating-contact__location-note">Bấm vào Google Maps để xem chi tiết vị trí và chỉ đường.</p>
    </div>

    <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="floating-contact__maps-link">
      <FaExternalLinkAlt />
      Xem trên Google Maps
    </a>
  </div>
)

function FloatingContactButtons() {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const previousPathRef = useRef(`${location.pathname}${location.search}`)
  const collapseTimerRef = useRef(null)

  const collapseMenu = () => {
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current)
    }

    setIsCollapsing(true)
    setIsExpanded(false)
    setActivePanel(null)

    collapseTimerRef.current = window.setTimeout(() => {
      setIsCollapsing(false)
      collapseTimerRef.current = null
    }, 360)
  }

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}`

    if (previousPathRef.current !== currentPath) {
      previousPathRef.current = currentPath
      collapseMenu()
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current)
      }
    }
  }, [])

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

  const panelTitle = activePanel
    ? contactActions.find((action) => action.id === activePanel)?.label ?? ''
    : ''

  const toggleMenu = () => {
    setIsExpanded((currentState) => {
      const nextState = !currentState

      if (!nextState) {
        collapseMenu()
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
    <div className={`floating-contact${isExpanded ? ' is-expanded' : ''}${isCollapsing ? ' is-collapsing' : ''}`}>
      <div className="floating-contact__stack" aria-label={t('floating.quickContact')}>
        {contactActions.map((action, index) => {
          const Icon = action.icon
          const isActive = activePanel === action.id

          return (
            <div
              key={action.id}
              className={`floating-contact__item${isActive ? ' is-active' : ''}`}
              style={{
                '--contact-index': contactActions.length - index,
                '--contact-collapse-index': index + 1,
              }}
            >
              <div
                className={`floating-contact__panel${isActive ? ' is-visible' : ''}`}
                role="dialog"
                aria-hidden={!isActive}
              >
                <div className="floating-contact__panel-shell">
                  <span className="floating-contact__panel-kicker">{panelTitle || action.label}</span>
                  <div className="floating-contact__panel-body">
                    {action.id === 'location' && isActive && <LocationPanelContent />}
                  </div>
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
