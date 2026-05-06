import { FiMapPin, FiClock, FiCalendar, FiUser, FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { FaBus } from 'react-icons/fa'
import { useState } from 'react'

const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function TripSummary({
  trip,
  seats,
  pickup,
  dropoff,
  date,
  extrasTotal,
  totalPrice,
  finalTotal,
  onContinue,
  contactInfo,
}) {
  const [expanded, setExpanded] = useState(true)

  const isValid =
    contactInfo.name.trim().length >= 2 &&
    /^(0|\+84)[0-9]{8,10}$/.test(contactInfo.phone.replace(/\s/g, '')) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)

  return (
    <div className="checkout-summary">
      {/* Giá tổng */}
      <div className="checkout-summary__price-block">
        <div className="checkout-summary__price-row">
          <span className="checkout-summary__price-label">Tạm tính</span>
          <span className="checkout-summary__price-value">{formatPrice(finalTotal)}</span>
        </div>
        {extrasTotal > 0 && (
          <div className="checkout-summary__price-row checkout-summary__price-row--sub">
            <span>Tiện ích</span>
            <span>+{formatPrice(extrasTotal)}</span>
          </div>
        )}
        <div className="checkout-summary__price-row checkout-summary__price-row--sub">
          <span>{seats.length} ghế × {formatPrice(trip.basePrice)}</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* Thông tin chuyến */}
      <div className="checkout-summary__trip">
        <button
          className="checkout-summary__trip-toggle"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          <span className="checkout-summary__trip-title">
            <FaBus /> Thông tin chuyến đi
          </span>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {expanded && (
          <div className="checkout-summary__trip-body">
            <div className="checkout-summary__trip-row">
              <FiCalendar className="checkout-summary__trip-icon" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="checkout-summary__trip-row">
              <FaBus className="checkout-summary__trip-icon" />
              <span><strong>{trip.operator}</strong> · {trip.busType}</span>
            </div>
            <div className="checkout-summary__trip-row">
              <FiClock className="checkout-summary__trip-icon" />
              <span>
                {trip.depTime} → {trip.arrTime} · {trip.duration}
              </span>
            </div>
            <div className="checkout-summary__trip-row">
              <FiMapPin className="checkout-summary__trip-icon" />
              <span>{pickup?.name || trip.depPoint}</span>
            </div>
            <div className="checkout-summary__trip-row checkout-summary__trip-row--arrow">
              <FiArrowRight className="checkout-summary__trip-icon checkout-summary__trip-icon--arrow" />
              <span>{dropoff?.name || trip.arrPoint}</span>
            </div>
            <div className="checkout-summary__trip-row">
              <FiUser className="checkout-summary__trip-icon" />
              <span>Ghế: <strong>{seats.join(', ')}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Nút Tiếp tục */}
      <button
        className={`checkout-cta ${!isValid ? 'checkout-cta--disabled' : ''}`}
        onClick={isValid ? onContinue : undefined}
        disabled={!isValid}
        type="button"
        title={!isValid ? 'Vui lòng điền đầy đủ thông tin liên hệ' : ''}
      >
        Tiếp tục →
      </button>

      <p className="checkout-summary__policy">
        Bằng việc nhấn <strong>Tiếp tục</strong>, bạn đồng ý với{' '}
        <a href="#" className="checkout-summary__policy-link">Chính sách bảo mật thanh toán</a>{' '}
        và{' '}
        <a href="#" className="checkout-summary__policy-link">Quy chế hoạt động</a>
      </p>
    </div>
  )
}
