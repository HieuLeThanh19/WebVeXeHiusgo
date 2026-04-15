import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'

const SAMPLE_ROUTES = [
  { id: 1, label: 'Sài Gòn ? Nha Trang', price: 120000, from: 'sai-gon', to: 'nha-trang' },
  { id: 2, label: 'Sài Gòn ? Ðà L?t', price: 150000, from: 'sai-gon', to: 'da-lat' },
  { id: 3, label: 'Sài Gòn ? Phan Thi?t', price: 90000, from: 'sai-gon', to: 'phan-thiet' },
  { id: 4, label: 'Sài Gòn ? Phan Rang', price: 100000, from: 'sai-gon', to: 'phan-rang' },
  { id: 5, label: 'Sài Gòn ? Vung Tàu', price: 75000, from: 'sai-gon', to: 'vung-tau' },
  { id: 6, label: 'Hà N?i ? H?i Phòng', price: 80000, from: 'ha-noi', to: 'hai-phong' },
  { id: 7, label: 'Hà N?i ? Ðà N?ng', price: 250000, from: 'ha-noi', to: 'da-nang' },
  { id: 8, label: 'Hà N?i ? Ninh Bình', price: 60000, from: 'ha-noi', to: 'ninh-binh' },
  { id: 9, label: 'Ðà N?ng ? H?i An', price: 40000, from: 'da-nang', to: 'hoi-an' },
  { id: 10, label: 'Ðà N?ng ? Hu?', price: 70000, from: 'da-nang', to: 'hue' },
  { id: 11, label: 'Sài Gòn ? C?n Tho', price: 110000, from: 'sai-gon', to: 'can-tho' },
  { id: 12, label: 'Sài Gòn ? Quy Nhon', price: 200000, from: 'sai-gon', to: 'quy-nhon' },
]

const DOUBLED = [...SAMPLE_ROUTES, ...SAMPLE_ROUTES]

const TickerRoutes = () => {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const { locale, t } = useLanguage()

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
                {t('ticker.fromPrice', { price: route.price.toLocaleString(locale) })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TickerRoutes
