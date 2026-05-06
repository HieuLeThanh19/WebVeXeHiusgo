import { useState } from 'react'
import { FiTag, FiEdit2, FiMapPin, FiClock, FiCalendar, FiUser, FiArrowRight, FiAlertTriangle } from 'react-icons/fi'
import { FaBus } from 'react-icons/fa'

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

const PROMO_CODES = {
  HIUSGO10: 50000,
  NEWUSER: 30000,
  HDSG50K: 50000,
}

export default function PaymentSummary({
  trip,
  seats,
  pickup,
  dropoff,
  date,
  totalPrice,
  extrasTotal,
  finalTotal,
  promoCode,
  onPromoChange,
  promoDiscount,
  onPromoApply,
  contactInfo,
  onEditContact,
  onPay,
  expired,
}) {
  const [promoInput, setPromoInput] = useState(promoCode)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (PROMO_CODES[code]) {
      onPromoChange(code)
      onPromoApply(PROMO_CODES[code])
      setPromoSuccess(`Áp dụng thành công! Giảm ${formatPrice(PROMO_CODES[code])}`)
      setPromoError('')
    } else {
      setPromoError('Mã giảm giá không hợp lệ hoặc đã hết hạn')
      setPromoSuccess('')
    }
  }

  const displayTotal = totalPrice + extrasTotal - promoDiscount

  return (
    <div className="checkout-summary">
      {/* Tổng tiền nổi bật */}
      <div className="checkout-summary__price-block checkout-summary__price-block--payment">
        <span className="checkout-summary__price-label">Tổng tiền thanh toán</span>
        <span className="checkout-summary__price-total">{formatPrice(displayTotal)}</span>
        <div className="checkout-summary__price-breakdown">
          <div className="checkout-summary__price-row checkout-summary__price-row--sub">
            <span>{seats.length} ghế × {formatPrice(trip.basePrice)}</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="checkout-summary__price-row checkout-summary__price-row--sub">
              <span>Tiện ích</span>
              <span>+{formatPrice(extrasTotal)}</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="checkout-summary__price-row checkout-summary__price-row--discount">
              <span>Mã giảm giá ({promoCode})</span>
              <span>-{formatPrice(promoDiscount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mã giảm giá */}
      <div className="checkout-promo">
        <label className="checkout-promo__label">
          <FiTag /> Mã giảm giá
        </label>
        <div className="checkout-promo__row">
          <input
            className="checkout-promo__input"
            type="text"
            placeholder="Nhập mã giảm giá"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
          />
          <button className="checkout-promo__btn" onClick={applyPromo} type="button">
            Áp dụng
          </button>
        </div>
        <p className="checkout-promo__hint">Bạn có thể áp dụng nhiều mã cùng lúc</p>
        {promoError && <p className="checkout-promo__error">{promoError}</p>}
        {promoSuccess && <p className="checkout-promo__success">{promoSuccess}</p>}
      </div>

      {/* Thông tin chuyến đi */}
      <div className="checkout-summary__trip">
        <p className="checkout-summary__trip-title">
          <FaBus /> Thông tin chuyến đi
        </p>
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
            <span>{trip.depTime} → {trip.arrTime} · {trip.duration}</span>
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
      </div>

      {/* Thông tin liên hệ + nút chỉnh sửa */}
      <div className="checkout-summary__contact">
        <div className="checkout-summary__contact-header">
          <p className="checkout-summary__contact-title">
            <FiUser /> Thông tin liên hệ
          </p>
          <button
            className="checkout-summary__edit-btn"
            onClick={onEditContact}
            type="button"
          >
            <FiEdit2 /> Chỉnh sửa
          </button>
        </div>
        <div className="checkout-summary__contact-body">
          <p><strong>{contactInfo.name || '—'}</strong></p>
          <p>{contactInfo.phone || '—'}</p>
          <p>{contactInfo.email || '—'}</p>
        </div>
      </div>

      {/* Cảnh báo không hoàn tiền */}
      <div className="checkout-summary__warning">
        <FiAlertTriangle />
        <span>Không hoàn tiền sau khi thanh toán</span>
      </div>

      {/* Nút Thanh toán */}
      <button
        className={`checkout-cta checkout-cta--pay ${expired ? 'checkout-cta--disabled' : ''}`}
        onClick={!expired ? onPay : undefined}
        disabled={expired}
        type="button"
      >
        {expired ? 'Hết thời gian thanh toán' : `Thanh toán ${formatPrice(displayTotal)}`}
      </button>

      <p className="checkout-summary__policy">
        Bằng việc nhấn <strong>Thanh toán</strong>, bạn đồng ý với{' '}
        <a href="#" className="checkout-summary__policy-link">Điều khoản dịch vụ</a>
      </p>
    </div>
  )
}
