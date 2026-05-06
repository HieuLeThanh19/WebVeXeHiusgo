import { useMemo, useState } from 'react'
import { FiTag, FiEdit2, FiMapPin, FiClock, FiCalendar, FiUser, FiArrowRight, FiAlertTriangle, FiChevronDown, FiX } from 'react-icons/fi'
import { FaBus } from 'react-icons/fa'
import { CHECKOUT_PROMOS, evaluatePromo } from '../../constants/checkoutPromos'

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

export default function PaymentSummary({
  trip,
  seats,
  pickup,
  dropoff,
  date,
  totalPrice,
  extrasTotal,
  finalTotal,
  selectedPayment,
  extrasBreakdown = [],
  promoCode,
  onPromoChange,
  promoDiscount,
  onPromoApply,
  contactInfo,
  onEditContact,
  onPay,
  expired,
}) {
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoError, setPromoError] = useState('')

  const subtotal = totalPrice + extrasTotal

  const promoRows = useMemo(() => {
    return CHECKOUT_PROMOS.map((promo) => {
      const result = evaluatePromo(promo, { total: subtotal, selectedPayment, trip })
      return { promo, ...result }
    })
  }, [selectedPayment, subtotal, trip])

  const applyPromo = (promo) => {
    const { eligible, reason } = evaluatePromo(promo, { total: subtotal, selectedPayment, trip })
    if (!eligible) {
      setPromoError(reason || 'Mã giảm giá không phù hợp')
      return
    }

    onPromoChange(promo.code)
    onPromoApply(promo.discount)
    setPromoError('')
    setPromoOpen(false)
  }

  const displayTotal = totalPrice + extrasTotal - promoDiscount

  return (
    <div className="checkout-summary">
      <div className="checkout-summary__price-block checkout-summary__price-block--payment">
        <span className="checkout-summary__price-label">Tổng tiền thanh toán</span>
        <span className="checkout-summary__price-total">{formatPrice(displayTotal)}</span>
        <div className="checkout-summary__price-breakdown">
          <div className="checkout-summary__price-row checkout-summary__price-row--sub">
            <span>
              {seats.length} ghế × {formatPrice(trip.basePrice)}
            </span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="checkout-summary__price-row checkout-summary__price-row--sub">
              <span>Tiện ích</span>
              <span>+{formatPrice(extrasTotal)}</span>
            </div>
          )}
          {extrasBreakdown.map((item) => (
            <div key={item.key} className="checkout-summary__price-row checkout-summary__price-row--sub">
              <span>{item.label}</span>
              <span>+{formatPrice(item.amount)}</span>
            </div>
          ))}
          {promoDiscount > 0 && (
            <div className="checkout-summary__price-row checkout-summary__price-row--discount">
              <span>Mã giảm giá ({promoCode})</span>
              <span>-{formatPrice(promoDiscount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="checkout-promo">
        <button
          className="checkout-promo__select"
          type="button"
          onClick={() => setPromoOpen((v) => !v)}
        >
          <span className="checkout-promo__select-left">
            <FiTag /> Mã giảm giá
          </span>
          <span className="checkout-promo__select-right">
            {promoCode ? <strong>{promoCode}</strong> : <span>Chọn mã</span>}
            <FiChevronDown className={promoOpen ? 'is-rotated' : ''} />
          </span>
        </button>

        {promoOpen && (
          <div className="checkout-promo__dropdown" role="listbox" aria-label="Danh sách mã giảm giá">
            <div className="checkout-promo__dropdown-head">
              <span>Chọn mã giảm giá</span>
              <button className="checkout-promo__close" type="button" onClick={() => setPromoOpen(false)} aria-label="Đóng">
                <FiX />
              </button>
            </div>
            <div className="checkout-promo__list">
              {promoRows.map(({ promo, eligible, reason }) => (
                <button
                  key={promo.code}
                  type="button"
                  className={`checkout-promo-item ${eligible ? '' : 'is-disabled'}`}
                  onClick={() => eligible && applyPromo(promo)}
                  disabled={!eligible}
                >
                  <div className="checkout-promo-item__main">
                    <div className="checkout-promo-item__row">
                      <span className="checkout-promo-item__code">{promo.code}</span>
                      <span className="checkout-promo-item__discount">-{formatPrice(promo.discount)}</span>
                    </div>
                    <div className="checkout-promo-item__title">{promo.title}</div>
                    <div className="checkout-promo-item__desc">{promo.description}</div>
                    {!eligible && <div className="checkout-promo-item__reason">{reason}</div>}
                  </div>
                  <span className="checkout-promo-item__action">{eligible ? 'Dùng' : 'Không dùng'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {promoError && <p className="checkout-promo__error">{promoError}</p>}
      </div>

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
            <span>
              <strong>{trip.operator}</strong> · {trip.busType}
            </span>
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
            <span>
              Ghế: <strong>{seats.join(', ')}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="checkout-summary__contact">
        <div className="checkout-summary__contact-header">
          <p className="checkout-summary__contact-title">
            <FiUser /> Thông tin liên hệ
          </p>
          <button className="checkout-summary__edit-btn" onClick={onEditContact} type="button">
            <FiEdit2 /> Chỉnh sửa
          </button>
        </div>
        <div className="checkout-summary__contact-body">
          <p>
            <strong>{contactInfo.name || '—'}</strong>
          </p>
          <p>{contactInfo.phone || '—'}</p>
          <p>{contactInfo.email || '—'}</p>
        </div>
      </div>

      <div className="checkout-summary__warning">
        <FiAlertTriangle />
        <span>Không hoàn tiền sau khi thanh toán</span>
      </div>

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

