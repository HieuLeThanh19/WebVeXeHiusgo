import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_LOCALE, t } from '../../content/siteText'
import { sampleRoutes } from '../../data/sampleTrips'

const DOUBLED = [...sampleRoutes, ...sampleRoutes]

const TickerRoutes = ({ onRouteSelect }) => {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)

  const handleClick = (route) => {
    const today = new Date().toISOString().split('T')[0]

    if (onRouteSelect) {
      onRouteSelect({ ...route, date: today })
      return
    }

    navigate(`/search?from=${route.from}&to=${route.to}&date=${today}`)
  }

  return (
    <section className="ticker-routes">
      <div
        className="ticker-routes__viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className={`ticker-routes__track${paused ? ' is-paused' : ''}`}
        >
          {DOUBLED.map((route, idx) => (
            <button
              key={`${route.id}-${idx}`}
              className="ticker-routes__card"
              onClick={() => handleClick(route)}
              type="button"
            >
              <span className="ticker-routes__card-label">{route.label}</span>
              <span className="ticker-routes__card-price">
                {t('ticker.fromPrice', { price: route.price.toLocaleString(APP_LOCALE) })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TickerRoutes
