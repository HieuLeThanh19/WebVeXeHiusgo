import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FiAlertCircle, FiArrowRight, FiCalendar, FiCheck, FiClock, FiFilter,
  FiMapPin, FiRefreshCw, FiSearch, FiStar, FiX,
} from 'react-icons/fi'
import { FaBus } from 'react-icons/fa'
import { APP_LOCALE } from '../content/siteText'
import {
  getLocationName,
  sampleDropoffPoints,
  samplePickupPoints,
  sampleSeatFloors,
  sampleTrips,
} from '../data/sampleTrips'
import '../styles/search-results.scss'

const BUS_IMAGES = [
  '/picture/AnhXeBuyt/1-3.jpg',
  '/picture/AnhXeBuyt/2734411-2758000j33710.webp',
  '/picture/AnhXeBuyt/a%20xe%20nam%201.jpg',
  '/picture/AnhXeBuyt/busdicampuchia.jpg',
  '/picture/AnhXeBuyt/DSC_5983.jpg',
  '/picture/AnhXeBuyt/igINhadz.jpg',
  '/picture/AnhXeBuyt/images.jpg',
  '/picture/AnhXeBuyt/thumbnail_2_7d4ef4fda5e86978bf3a1b15dea13632.jpg',
  '/picture/AnhXeBuyt/wlc-MOBIHOME-PREMIUM-VIEW1-750x424.jpg',
  '/picture/AnhXeBuyt/xe-giuong-nam-thaco-24-cho-thaco-24-phong-2708670j30270x16.webp',
  '/picture/AnhXeBuyt/xe-giuong-nam.jpg',
]

const BADGE_CONFIG = {
  premium: { label: 'Xe xịn', cls: 'sr-trip-card__badge--premium' },
  discount: { label: 'Giảm giá', cls: 'sr-trip-card__badge--discount' },
  gps: { label: 'Có GPS', cls: 'sr-trip-card__badge--gps' },
  ac: { label: 'Điều hoà', cls: 'sr-trip-card__badge--ac' },
}

const SORT_OPTIONS = [
  { value: 'time-asc', label: 'Giờ đi: Sớm nhất' },
  { value: 'price-asc', label: 'Giá: Thấp đến cao' },
  { value: 'price-desc', label: 'Giá: Cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
]

const formatPrice = (price) => `${price.toLocaleString(APP_LOCALE)}đ`

const getTripImage = (trip) => {
  const key = `${trip.id}-${trip.operator}-${trip.busType}`
  const hash = [...key].reduce((total, char) => total + char.charCodeAt(0), 0)

  return BUS_IMAGES[hash % BUS_IMAGES.length]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const createLocalDateTime = (date, time) => {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

const getDurationHours = (duration) => {
  const match = duration.match(/\d+(?:\.\d+)?/)

  return match ? Number(match[0]) : 0
}

const getArrivalInfo = (date, trip) => {
  if (!date) return null

  const departure = createLocalDateTime(date, trip.depTime)
  const arrival = new Date(departure.getTime() + getDurationHours(trip.duration) * 60 * 60 * 1000)
  const dayOffset = Math.floor((arrival - new Date(departure.getFullYear(), departure.getMonth(), departure.getDate())) / 86400000)

  return {
    dateLabel: arrival.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    dayOffset,
  }
}

const filterPoints = (points, query) => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return points

  return points.filter((point) =>
    `${point.name} ${point.address}`.toLowerCase().includes(normalizedQuery)
  )
}

const useBodyScrollLock = () => {
  useEffect(() => {
    const scrollY = window.scrollY
    const previousBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }

    document.body.classList.add('hiusgo-modal-open')
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.classList.remove('hiusgo-modal-open')
      document.body.style.overflow = previousBodyStyle.overflow
      document.body.style.position = previousBodyStyle.position
      document.body.style.top = previousBodyStyle.top
      document.body.style.width = previousBodyStyle.width
      window.scrollTo(0, scrollY)
    }
  }, [])
}

const SeatModal = ({ trip, onClose, onConfirm }) => {
  useBodyScrollLock()
  const [chosen, setChosen] = useState([])

  const toggleSeat = (seat) => {
    if (seat.status === 'sold') return

    const isChosen = chosen.includes(seat.id)
    if (!isChosen && chosen.length >= 4) return

    setChosen((currentSeats) =>
      isChosen ? currentSeats.filter((seatId) => seatId !== seat.id) : [...currentSeats, seat.id]
    )
  }

  const totalPrice = chosen.length * trip.basePrice

  return (
    <div className="seat-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="seat-modal">
        <div className="seat-modal__header">
          <div>
            <p className="seat-modal__title">Chọn ghế - {trip.operator}</p>
            <p className="seat-modal__subtitle">
              {trip.depTime} đến {trip.arrTime} · {trip.busType}
            </p>
          </div>
          <button className="seat-modal__close" onClick={onClose} aria-label="Đóng">
            <FiX />
          </button>
        </div>

        <div className="seat-modal__body">
          <div className="seat-modal__floors">
            {Object.entries(sampleSeatFloors).map(([floorKey, floorSeats]) => (
              <div key={floorKey}>
                <p className="seat-modal__floor-title">
                  {floorKey === 'lower' ? 'Tầng dưới' : 'Tầng trên'}
                </p>
                <div className="seat-modal__floor-card">
                  <div className="seat-modal__seat-grid">
                    {floorSeats.map((seat) => (
                      <button
                        key={seat.id}
                        className={[
                          'seat-btn',
                          seat.status === 'sold' ? 'is-sold' : '',
                          chosen.includes(seat.id) ? 'is-chosen' : '',
                        ].join(' ')}
                        onClick={() => toggleSeat(seat)}
                        disabled={seat.status === 'sold'}
                        title={seat.label}
                        type="button"
                      >
                        {seat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="seat-modal__legend">
          <div className="seat-modal__legend-item">
            <span className="seat-modal__legend-dot seat-modal__legend-dot--empty" />
            Còn trống
          </div>
          <div className="seat-modal__legend-item">
            <span className="seat-modal__legend-dot seat-modal__legend-dot--chosen" />
            Đã chọn
          </div>
          <div className="seat-modal__legend-item">
            <span className="seat-modal__legend-dot seat-modal__legend-dot--sold" />
            Đã bán
          </div>
        </div>

        <div className="seat-modal__footer">
          <div className="seat-modal__footer-info">
            {chosen.length > 0 ? (
              <>
                Ghế đã chọn: <b>{chosen.join(', ')}</b>
                <strong>{formatPrice(totalPrice)}</strong>
              </>
            ) : (
              <span>Chọn tối đa 4 ghế</span>
            )}
          </div>
          <button
            className="seat-modal__footer-btn"
            disabled={chosen.length === 0}
            onClick={() => onConfirm(chosen, totalPrice)}
            type="button"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  )
}

const PickupModal = ({ trip, chosenSeats, totalPrice, onClose, onConfirm }) => {
  useBodyScrollLock()
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [pickupQuery, setPickupQuery] = useState('')
  const [dropoffQuery, setDropoffQuery] = useState('')
  const filteredPickupPoints = useMemo(
    () => filterPoints(samplePickupPoints, pickupQuery),
    [pickupQuery]
  )
  const filteredDropoffPoints = useMemo(
    () => filterPoints(sampleDropoffPoints, dropoffQuery),
    [dropoffQuery]
  )

  return (
    <div className="pickup-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pickup-modal">
        <div className="pickup-modal__header">
          <div>
            <p className="pickup-modal__title">Chọn điểm đón &amp; trả</p>
            <p className="pickup-modal__subtitle">
              {trip.operator} · {trip.depTime} đến {trip.arrTime}
            </p>
          </div>
          <button className="pickup-modal__close" onClick={onClose} aria-label="Đóng" type="button">
            <FiX />
          </button>
        </div>

        <div className="pickup-modal__progress">
          <div className="pickup-modal__step is-done">
            <span className="pickup-modal__step-num"><FiCheck size={10} /></span>
            Chọn ghế
          </div>
          <div className="pickup-modal__step-sep" />
          <div className="pickup-modal__step is-active">
            <span className="pickup-modal__step-num">2</span>
            Điểm đón / trả
          </div>
          <div className="pickup-modal__step-sep" />
          <div className="pickup-modal__step">
            <span className="pickup-modal__step-num">3</span>
            Xác nhận
          </div>
        </div>

        <div className="pickup-modal__body">
          <div className="pickup-modal__cols">
            <div>
              <p className="pickup-modal__col-title">
                <FiMapPin /> Điểm đón
              </p>
              <label className="pickup-modal__search">
                <FiSearch />
                <input
                  value={pickupQuery}
                  onChange={(e) => setPickupQuery(e.target.value)}
                  placeholder="Tìm điểm đón"
                />
              </label>
              <div className="pickup-modal__point-list">
                {filteredPickupPoints.length > 0 ? (
                  filteredPickupPoints.map((point) => (
                    <button
                      key={point.id}
                      className={`pickup-option${pickup === point.id ? ' is-selected' : ''}`}
                      onClick={() => setPickup(point.id)}
                      type="button"
                    >
                      <span className="pickup-option__icon"><FiMapPin /></span>
                      <span>
                        <p className="pickup-option__name">{point.name}</p>
                        <p className="pickup-option__address">{point.address}</p>
                      </span>
                      <span className="pickup-option__check"><FiCheck /></span>
                    </button>
                  ))
                ) : (
                  <p className="pickup-modal__empty">Không tìm thấy điểm đón phù hợp.</p>
                )}
              </div>
            </div>

            <div>
              <p className="pickup-modal__col-title">
                <FiMapPin /> Điểm trả
              </p>
              <label className="pickup-modal__search">
                <FiSearch />
                <input
                  value={dropoffQuery}
                  onChange={(e) => setDropoffQuery(e.target.value)}
                  placeholder="Tìm điểm trả"
                />
              </label>
              <div className="pickup-modal__point-list">
                {filteredDropoffPoints.length > 0 ? (
                  filteredDropoffPoints.map((point) => (
                    <button
                      key={point.id}
                      className={`pickup-option${dropoff === point.id ? ' is-selected' : ''}`}
                      onClick={() => setDropoff(point.id)}
                      type="button"
                    >
                      <span className="pickup-option__icon"><FiMapPin /></span>
                      <span>
                        <p className="pickup-option__name">{point.name}</p>
                        <p className="pickup-option__address">{point.address}</p>
                      </span>
                      <span className="pickup-option__check"><FiCheck /></span>
                    </button>
                  ))
                ) : (
                  <p className="pickup-modal__empty">Không tìm thấy điểm trả phù hợp.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pickup-modal__footer">
          <div className="pickup-modal__footer-summary">
            Ghế: <strong>{chosenSeats.join(', ')}</strong><br />
            Tổng: <strong style={{ color: '#1f9d8f' }}>{formatPrice(totalPrice)}</strong>
          </div>
          <button
            className="pickup-modal__footer-btn"
            disabled={!pickup || !dropoff}
            onClick={onConfirm}
            type="button"
          >
            Xác nhận đặt vé
          </button>
        </div>
      </div>
    </div>
  )
}

const SearchResults = ({ searchCriteria, embedded = false, onChangeSearch }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('time-asc')
  const [filterType, setFilterType] = useState('all')
  const [filterTime, setFilterTime] = useState('all')
  const [seatModalTrip, setSeatModalTrip] = useState(null)
  const [pickupModal, setPickupModal] = useState(null)
  const [toast, setToast] = useState(false)

  const criteria = searchCriteria || {
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
  }

  const filteredTrips = useMemo(() => {
    if (!criteria.from || !criteria.to) return []

    return sampleTrips.filter((trip) => {
      if (trip.from !== criteria.from || trip.to !== criteria.to) return false
      if (filterType === 'limousine' && !trip.busType.toLowerCase().includes('limousine')) return false
      if (filterType === 'giuong' && !trip.busType.toLowerCase().includes('giường')) return false

      if (filterTime !== 'all') {
        const hour = Number.parseInt(trip.depTime.split(':')[0], 10)
        if (filterTime === 'morning' && (hour < 5 || hour >= 12)) return false
        if (filterTime === 'noon' && (hour < 12 || hour >= 18)) return false
        if (filterTime === 'night' && (hour < 18 || hour >= 24)) return false
      }

      return true
    })
  }, [criteria.from, criteria.to, filterTime, filterType])

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice
    if (sortBy === 'rating') return b.rating - a.rating
    return a.depTime.localeCompare(b.depTime)
  })

  const handleSeatConfirm = (seats, price) => {
    setPickupModal({ trip: seatModalTrip, seats, price })
    setSeatModalTrip(null)
  }

  const handlePickupConfirm = () => {
    setPickupModal(null)
    setToast(true)
    window.setTimeout(() => setToast(false), 3500)
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterTime('all')
  }

  const handleChangeSearch = () => {
    if (embedded) {
      onChangeSearch?.()
      return
    }

    navigate('/')
  }

  return (
    <div className={`search-results-page${embedded ? ' is-embedded' : ''}`}>
      <div className="sr-route-bar">
        <div className="sr-route-bar__inner">
          <div className="sr-route-bar__route">
            <span>{getLocationName(criteria.from)}</span>
            <FiArrowRight className="sr-route-bar__arrow" />
            <span>{getLocationName(criteria.to)}</span>
          </div>
          <div className="sr-route-bar__meta">
            <span className="sr-route-bar__meta-item">
              <FiCalendar /> {formatDate(criteria.date)}
            </span>
            <span className="sr-route-bar__meta-item">
              <FaBus /> {sortedTrips.length} chuyến phù hợp
            </span>
          </div>
          <button className="sr-route-bar__change" onClick={handleChangeSearch} type="button">
            <FiRefreshCw style={{ marginRight: 6 }} />
            Đổi tìm kiếm
          </button>
        </div>
      </div>

      <div className="sr-layout">
        <aside className="sr-filter">
          <div className="sr-filter__header">
            <h3><FiFilter style={{ marginRight: 6 }} />Bộ lọc</h3>
            <button className="sr-filter__clear" onClick={clearFilters} type="button">
              Xóa lọc
            </button>
          </div>

          <div className="sr-filter__section">
            <p className="sr-filter__section-title">Loại xe</p>
            <div className="sr-filter__radio-group">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'limousine', label: 'Limousine' },
                { value: 'giuong', label: 'Giường nằm' },
              ].map((option) => (
                <label key={option.value} className="sr-filter__radio">
                  <input
                    checked={filterType === option.value}
                    name="busType"
                    onChange={() => setFilterType(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="sr-filter__section">
            <p className="sr-filter__section-title">Giờ khởi hành</p>
            <div className="sr-filter__radio-group">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'morning', label: 'Sáng (05:00 - 12:00)' },
                { value: 'noon', label: 'Chiều (12:00 - 18:00)' },
                { value: 'night', label: 'Tối (18:00 - 24:00)' },
              ].map((option) => (
                <label key={option.value} className="sr-filter__radio">
                  <input
                    checked={filterTime === option.value}
                    name="depTime"
                    onChange={() => setFilterTime(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="sr-list">
          <div className="sr-list-header">
            <p className="sr-list-header__count">
              Tìm thấy <strong>{sortedTrips.length}</strong> chuyến xe phù hợp
            </p>
            <div className="sr-list-header__sort">
              <span>Sắp xếp:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {sortedTrips.length === 0 ? (
            <div className="sr-empty">
              <FiAlertCircle />
              <h3>Không có chuyến phù hợp</h3>
              <p>Hãy thử chọn tuyến khác hoặc đổi bộ lọc để xem thêm lựa chọn.</p>
            </div>
          ) : (
            sortedTrips.map((trip) => {
              const arrivalInfo = getArrivalInfo(criteria.date, trip)

              return (
              <article key={trip.id} className="sr-trip-card">
                <div className="sr-trip-card__body">
                  <div className="sr-trip-card__thumb">
                    <img src={getTripImage(trip)} alt={`Xe ${trip.operator}`} loading="lazy" />
                  </div>

                  <div className="sr-trip-card__info">
                    <div className="sr-trip-card__operator-row">
                      <h4 className="sr-trip-card__operator-name">{trip.operator}</h4>
                      <span className="sr-trip-card__rating">
                        <FiStar /> {trip.rating}
                      </span>
                      <span className="sr-trip-card__bus-type">{trip.busType}</span>
                    </div>

                    <div className="sr-trip-card__time-row">
                      <span className="sr-trip-card__time-dep">{trip.depTime}</span>
                      <div className="sr-trip-card__time-arrow">
                        <div className="sr-trip-card__time-arrow-line" />
                        <span className="sr-trip-card__time-arrow-duration">
                          <FiClock size={11} style={{ marginRight: 3 }} />
                          {trip.duration}
                        </span>
                      </div>
                      <span className="sr-trip-card__time-arr-wrap">
                        <span className="sr-trip-card__time-arr">{trip.arrTime}</span>
                        {arrivalInfo && (
                          <span className="sr-trip-card__arrival-date">
                            {arrivalInfo.dateLabel}
                            {arrivalInfo.dayOffset > 0 && (
                              <span className="sr-trip-card__arrival-next-day">+{arrivalInfo.dayOffset} ngày</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="sr-trip-card__stops">
                      <div className="sr-trip-card__stop">
                        <span className="sr-trip-card__stop-label">Đón tại</span>
                        <span className="sr-trip-card__stop-name">{trip.depPoint}</span>
                      </div>
                      <div className="sr-trip-card__stop">
                        <span className="sr-trip-card__stop-label">Trả tại</span>
                        <span className="sr-trip-card__stop-name">{trip.arrPoint}</span>
                      </div>
                    </div>

                    {criteria.date && (
                      <div className="sr-trip-card__departure-date">
                        <FiCalendar />
                        <span>Ngày đi: {formatDate(criteria.date)}</span>
                      </div>
                    )}

                    <div className="sr-trip-card__badges">
                      {trip.badges.map((badge) => (
                        <span key={badge} className={`sr-trip-card__badge ${BADGE_CONFIG[badge].cls}`}>
                          {BADGE_CONFIG[badge].label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sr-trip-card__action">
                    <div className="sr-trip-card__price-block">
                      <p className="sr-trip-card__price-label">Chỉ từ</p>
                      <p className="sr-trip-card__price">
                        {trip.basePrice.toLocaleString(APP_LOCALE)}
                        <span className="sr-trip-card__price-unit">đ</span>
                      </p>
                      <p className={trip.availableSeats <= 5 ? 'sr-trip-card__seats-left' : 'sr-trip-card__seats-ok'}>
                        Còn {trip.availableSeats} ghế{trip.availableSeats <= 5 ? '!' : ''}
                      </p>
                    </div>
                    <button className="sr-trip-card__btn" onClick={() => setSeatModalTrip(trip)} type="button">
                      Chọn chuyến
                    </button>
                  </div>
                </div>
              </article>
              )
            })
          )}
        </section>
      </div>

      {seatModalTrip && (
        <SeatModal
          trip={seatModalTrip}
          onClose={() => setSeatModalTrip(null)}
          onConfirm={handleSeatConfirm}
        />
      )}

      {pickupModal && (
        <PickupModal
          trip={pickupModal.trip}
          chosenSeats={pickupModal.seats}
          totalPrice={pickupModal.price}
          onClose={() => setPickupModal(null)}
          onConfirm={handlePickupConfirm}
        />
      )}

      {toast && (
        <div className="booking-toast">
          <FiCheck />
          Đặt vé thành công! Chúng tôi sẽ gửi xác nhận qua SMS.
        </div>
      )}
    </div>
  )
}

export default SearchResults
