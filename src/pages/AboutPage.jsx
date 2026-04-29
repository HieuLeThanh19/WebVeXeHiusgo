import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/about.scss'

const ROUTES_SLIDER = [
  { from: 'Sài Gòn', to: 'Đà Lạt', price: '220k', duration: '6h', tag: 'HOT' },
  { from: 'Sài Gòn', to: 'Nha Trang', price: '250k', duration: '8h', tag: 'DEAL' },
  { from: 'Sài Gòn', to: 'Vũng Tàu', price: '120k', duration: '2h', tag: 'GẦN' },
  { from: 'Sài Gòn', to: 'Phan Thiết', price: '150k', duration: '3h', tag: 'BIỂN' },
  { from: 'Sài Gòn', to: 'Cần Thơ', price: '180k', duration: '4h', tag: 'PHỔ BIẾN' },
  { from: 'Sài Gòn', to: 'Phú Quốc', price: '350k', duration: '10h', tag: 'NGHỈ DƯỠNG' },
  { from: 'Hà Nội', to: 'Đà Nẵng', price: '320k', duration: '16h', tag: 'XA' },
  { from: 'Hà Nội', to: 'Hải Phòng', price: '110k', duration: '2h', tag: 'NHANH' },
  { from: 'Hà Nội', to: 'Ninh Bình', price: '90k', duration: '2h', tag: 'RẺ' },
  { from: 'Hà Nội', to: 'Sapa', price: '260k', duration: '6h', tag: 'DU LỊCH' },
  { from: 'Đà Nẵng', to: 'Huế', price: '90k', duration: '3h', tag: 'GẦN' },
  { from: 'Đà Nẵng', to: 'Hội An', price: '60k', duration: '1h', tag: 'RẺ' },
  { from: 'Nha Trang', to: 'Đà Lạt', price: '140k', duration: '4h', tag: 'MÁT MẺ' },
  { from: 'Cần Thơ', to: 'Cà Mau', price: '160k', duration: '4h', tag: 'MIỀN TÂY' },
  { from: 'Buôn Ma Thuột', to: 'Đà Lạt', price: '130k', duration: '3h', tag: 'TÂY NGUYÊN' },
]

const FEATURES = [
  { icon: '🔄', title: 'Linh hoạt đổi vé', desc: 'Thay đổi lịch trình dễ dàng trước 4 tiếng khởi hành, không mất phí.' },
  { icon: '📱', title: 'Không cần in vé', desc: 'Chỉ cần mã QR trên điện thoại, lên xe ngay, nhanh chóng và tiện lợi.' },
  { icon: '💸', title: 'Giá tốt nhất', desc: 'Cam kết giá thấp hơn hoặc bằng nhà xe. Hoàn tiền nếu tìm được mức giá rẻ hơn.' },
  { icon: '🎧', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng qua chat, hotline và email mọi lúc.' },
]

const toSearchSlug = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const RouteCard = ({ from, to, price, duration, tag, onClick }) => (
  <button className="route-card" type="button" onClick={onClick}>
    <div className="route-tag">{tag}</div>
    <div className="route-path">
      <span className="route-city">{from}</span>
      <span className="route-arrow">→</span>
      <span className="route-city">{to}</span>
    </div>
    <div className="route-meta">
      <span className="route-duration">⏱ {duration}</span>
      <span className="route-price">từ {price}</span>
    </div>
  </button>
)

const FeatureBox = ({ icon, title, desc }) => (
  <div className="feature-box">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{desc}</p>
  </div>
)

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/MrRChr1YtJhgKJDT6'

const MapFullModal = ({ onClose }) => {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    const init = () => {
      if (!mapRef.current || instanceRef.current || !window.L) return
      const L = window.L

      const map = L.map(mapRef.current, {
        center: [11.1339, 106.6681],
        zoom: 17,
        scrollWheelZoom: true,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      const icon = L.divIcon({
        className: '',
        html: '<div class="custom-marker"><div class="marker-pulse"></div><div class="marker-dot"></div></div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      L.marker([11.1339, 106.6681], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="lf-popup">
            <strong>🏫 ĐH Thủ Dầu Một – Văn phòng HiusGo</strong><br/>
            6 Trần Văn Ơn, Phú Hòa,<br/>Thủ Dầu Một, Bình Dương
          </div>`,
          { maxWidth: 280 },
        )
        .openPopup()

      instanceRef.current = map
    }

    if (window.L) {
      window.setTimeout(init, 120)
    } else {
      const timer = window.setInterval(() => {
        if (window.L) {
          window.clearInterval(timer)
          window.setTimeout(init, 120)
        }
      }, 200)

      return () => window.clearInterval(timer)
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--map" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-pin">📍</span>
            <div>
              <h2>Văn phòng HiusGo</h2>
              <p className="modal-address">Trường ĐH Thủ Dầu Một – 6 Trần Văn Ơn, Phú Hòa, Thủ Dầu Một, Bình Dương</p>
            </div>
          </div>
          <div className="modal-header-actions">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-maps-btn"
              title="Xem trên Google Maps"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Google Maps
            </a>
            <button className="modal-close" type="button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="modal-map-body" ref={mapRef} />
      </div>
    </div>
  )
}

const OfficeMap = ({ onExpand }) => {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (window.L) {
      setLoaded(true)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current || instanceRef.current) return
    const L = window.L

    const map = L.map(mapRef.current, {
      center: [11.1339, 106.6681],
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      touchZoom: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    const icon = L.divIcon({
      className: '',
      html: '<div class="custom-marker"><div class="marker-pulse"></div><div class="marker-dot"></div></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    L.marker([11.1339, 106.6681], { icon })
      .addTo(map)
      .bindTooltip('HiusGo – Văn phòng', { permanent: true, direction: 'top', offset: [0, -20] })

    instanceRef.current = map
  }, [loaded])

  return (
    <div className="map-wrapper">
      {!loaded && (
        <div className="map-skeleton">
          <div className="map-skeleton-text">Đang tải bản đồ…</div>
        </div>
      )}

      <div ref={mapRef} className="leaflet-map" style={{ opacity: loaded ? 1 : 0 }} />

      {loaded && (
        <>
          <div className="map-address-card">
            <div className="mac-icon">📍</div>
            <div>
              <div className="mac-name">Trường ĐH Thủ Dầu Một</div>
              <div className="mac-addr">6 Trần Văn Ơn, Phú Hòa, Thủ Dầu Một, Bình Dương</div>
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="mac-maps-link">
                Xem trên Google Maps
              </a>
            </div>
          </div>

          <button className="map-expand-btn" type="button" onClick={onExpand} title="Phóng to bản đồ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Phóng to
          </button>
        </>
      )}
    </div>
  )
}

const VISIBLE = 5
const CARD_W = 220
const GAP = 16

const AboutPage = () => {
  const navigate = useNavigate()
  const [mapOpen, setMapOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const maxIdx = ROUTES_SLIDER.length - VISIBLE

  const prev = () => setIdx((i) => Math.max(0, i - 1))
  const next = () => setIdx((i) => Math.min(maxIdx, i + 1))

  const handleFeatureScroll = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleRouteSelect = (route) => {
    const today = new Date().toISOString().split('T')[0]
    navigate(`/search?from=${toSearchSlug(route.from)}&to=${toSearchSlug(route.to)}&date=${today}`)
  }

  return (
    <div className="about-page">
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&q=80" alt="bus" className="hero-img" />
          <div className="hero-overlay" />
        </div>

        <div className="hero-content container">
          <div className="hero-badge">🚀 Nền tảng đặt vé xe hàng đầu Việt Nam</div>
          <h1 className="hero-heading">
            Hành trình của bạn,
            <br />
            <span className="hero-highlight">HiusGo lo tất cả</span>
          </h1>
          <p className="hero-sub">
            Đặt vé xe nhanh chóng, an toàn, tiết kiệm. Hơn 500+ tuyến đường toàn quốc, giá tốt nhất và luôn đúng giờ.
          </p>
          <div className="hero-btns">
            <Link to="/" className="btn-primary">Đặt vé ngay</Link>
            <button type="button" className="btn-outline" onClick={handleFeatureScroll}>Khám phá thêm</button>
          </div>
        </div>

        <div className="route-slider-bar">
          <div className="container">
            <div className="slider-row">
              <button
                type="button"
                className={`slider-arrow${idx === 0 ? ' disabled' : ''}`}
                onClick={prev}
                disabled={idx === 0}
                aria-label="Trước"
              >
                ‹
              </button>

              <div className="slider-viewport">
                <div
                  className="slider-track"
                  style={{ transform: `translateX(-${idx * (CARD_W + GAP)}px)` }}
                >
                  {ROUTES_SLIDER.map((route, index) => (
                    <RouteCard key={index} {...route} onClick={() => handleRouteSelect(route)} />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`slider-arrow${idx >= maxIdx ? ' disabled' : ''}`}
                onClick={next}
                disabled={idx >= maxIdx}
                aria-label="Tiếp"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="commitment-section">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">CAM KẾT TỪ HIUSGO</p>
            <h2 className="section-title">Vì mỗi chuyến đi là một trải nghiệm</h2>
          </div>
          <div className="commitment-layout">
            <div className="commitment-image">
              <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&q=80" alt="HiusGo cam kết" />
              <div className="commitment-image-badge">
                <span className="cib-number">500+</span>
                <span className="cib-label">Tuyến đường toàn quốc</span>
              </div>
            </div>
            <div className="commitment-content">
              <div className="commitment-paragraphs">
                <p>Tại <strong>HIUSGO</strong>, chúng tôi tin rằng mỗi chuyến đi không chỉ là sự di chuyển, mà còn là trải nghiệm gắn liền với sự tiện lợi và cảm xúc của khách hàng. Vì vậy, chúng tôi xây dựng nền tảng đặt vé xe với mục tiêu mang đến dịch vụ nhanh chóng, minh bạch và đáng tin cậy cho mọi hành trình.</p>
                <p>Chúng tôi cam kết cung cấp một hệ thống đặt vé đơn giản, dễ sử dụng và tối ưu trải nghiệm người dùng. Từ việc tìm kiếm tuyến đường, so sánh giá vé đến đặt chỗ và thanh toán, tất cả đều được thiết kế để giúp bạn tiết kiệm thời gian và thao tác một cách hiệu quả.</p>
                <p><strong>Minh bạch</strong> là giá trị cốt lõi mà chúng tôi luôn đặt lên hàng đầu. Mọi thông tin về giá vé đều được hiển thị rõ ràng, không có chi phí ẩn. Chúng tôi hợp tác với các nhà xe uy tín nhằm đảm bảo chất lượng dịch vụ và độ chính xác của thông tin. Giá bạn nhìn thấy chính là giá bạn thanh toán.</p>
                <p>Bên cạnh đó, HIUSGO luôn chú trọng đến chất lượng và độ an toàn của mỗi chuyến đi. Các đối tác vận chuyển được lựa chọn và đánh giá dựa trên nhiều tiêu chí như chất lượng xe, thái độ phục vụ và độ đúng giờ. Những phản hồi từ khách hàng được chúng tôi tiếp nhận và cải thiện liên tục.</p>
                <p>Chúng tôi cũng cam kết <strong>hỗ trợ khách hàng</strong> một cách nhanh chóng và tận tâm. Đội ngũ hỗ trợ luôn sẵn sàng giải đáp thắc mắc, xử lý các vấn đề phát sinh hoặc hỗ trợ thay đổi lịch trình khi cần thiết, nhằm đảm bảo quyền lợi tốt nhất cho khách hàng.</p>
                <p>Ngoài ra, HIUSGO không ngừng ứng dụng công nghệ để nâng cao hiệu suất và bảo mật hệ thống. Thông tin cá nhân và giao dịch của người dùng luôn được bảo vệ theo các tiêu chuẩn an toàn, giúp bạn yên tâm khi sử dụng dịch vụ.</p>
                <p>Với định hướng phát triển bền vững, HIUSGO sẽ tiếp tục cải tiến và mở rộng dịch vụ trong tương lai. Sự tin tưởng của khách hàng chính là động lực để chúng tôi không ngừng hoàn thiện, mang đến trải nghiệm tốt hơn mỗi ngày.</p>
              </div>
              <div className="commitment-pills">
                <span className="cpill">✅ Không phí ẩn</span>
                <span className="cpill">✅ Đối tác uy tín</span>
                <span className="cpill">✅ Hỗ trợ 24/7</span>
                <span className="cpill">✅ Bảo mật giao dịch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">TẠI SAO CHỌN HIUSGO</p>
            <h2 className="section-title">Trải nghiệm đặt vé khác biệt</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature, index) => <FeatureBox key={index} {...feature} />)}
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">ĐỊA CHỈ VĂN PHÒNG</p>
            <h2 className="section-title">Tìm chúng tôi tại đây</h2>
            <p className="section-sub">Nhấn nút phóng to để xem bản đồ chi tiết</p>
          </div>
          <OfficeMap onExpand={() => setMapOpen(true)} />
        </div>
      </section>

      {mapOpen && <MapFullModal onClose={() => setMapOpen(false)} />}
    </div>
  )
}

export default AboutPage
