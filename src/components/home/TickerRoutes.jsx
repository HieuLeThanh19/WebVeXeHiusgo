import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_LOCALE, t } from '../../content/siteText'

const SAMPLE_ROUTES = [
  { id: 1, label: 'Sài Gòn - Nha Trang', price: 120000, from: 'sai-gon', to: 'nha-trang' },
  { id: 2, label: 'Sài Gòn - Đà Lạt', price: 150000, from: 'sai-gon', to: 'da-lat' },
  { id: 3, label: 'Sài Gòn - Phan Thiết', price: 90000, from: 'sai-gon', to: 'phan-thiet' },
  { id: 4, label: 'Sài Gòn - Phan Rang', price: 100000, from: 'sai-gon', to: 'phan-rang' },
  { id: 5, label: 'Sài Gòn - Vũng Tàu', price: 75000, from: 'sai-gon', to: 'vung-tau' },
  { id: 6, label: 'Hà Nội - Hải Phòng', price: 80000, from: 'ha-noi', to: 'hai-phong' },
  { id: 7, label: 'Hà Nội - Đà Nẵng', price: 250000, from: 'ha-noi', to: 'da-nang' },
  { id: 8, label: 'Hà Nội - Ninh Bình', price: 60000, from: 'ha-noi', to: 'ninh-binh' },
  { id: 9, label: 'Đà Nẵng - Hội An', price: 40000, from: 'da-nang', to: 'hoi-an' },
  { id: 10, label: 'Đà Nẵng - Huế', price: 70000, from: 'da-nang', to: 'hue' },
  { id: 11, label: 'Sài Gòn - Cần Thơ', price: 110000, from: 'sai-gon', to: 'can-tho' },
  { id: 12, label: 'Sài Gòn - Quy Nhơn', price: 200000, from: 'sai-gon', to: 'quy-nhon' },
]

const DOUBLED = [...SAMPLE_ROUTES, ...SAMPLE_ROUTES]

const TickerRoutes = () => {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)

  const handleClick = (route) => {
    const today = new Date().toISOString().split('T')[0]
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
