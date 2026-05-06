import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiClock, FiMapPin, FiX, FiCreditCard, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { FaBus } from 'react-icons/fa'

const STORAGE_KEY = 'hiusgo-pending-payment'

const formatPrice = (p) => `${Number(p || 0).toLocaleString('vi-VN')}đ`

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatTimer = (secs) => {
  const s = Math.max(0, secs)
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const r = String(s % 60).padStart(2, '0')
  return `${m}:${r}`
}

function readPending() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function clearPending() {
  window.localStorage.removeItem(STORAGE_KEY)
}

export default function PendingPaymentPopup() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [pending, setPending] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const next = readPending()
    if (!next) {
      setPending(null)
      setOpen(false)
      setVisible(false)
      return
    }

    const remaining = Math.floor((next.expiresAt - Date.now()) / 1000)
    if (remaining <= 0) {
      clearPending()
      setPending(null)
      setOpen(false)
      setVisible(false)
      return
    }

    setPending(next)
    const shouldOpen = location.pathname !== '/checkout'
    setOpen(shouldOpen)
    if (shouldOpen) {
      // Trì hoãn nhẹ để kích hoạt animation slide-in
      setTimeout(() => setVisible(true), 80)
    } else {
      setVisible(false)
    }
  }, [location.pathname, location.search, location.hash])

  const timeLeft = useMemo(() => {
    if (!pending?.expiresAt) return 0
    return Math.floor((pending.expiresAt - now) / 1000)
  }, [now, pending?.expiresAt])

  useEffect(() => {
    if (!pending) return
    if (timeLeft > 0) return
    clearPending()
    setPending(null)
    setOpen(false)
    setVisible(false)
  }, [pending, timeLeft])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setOpen(false), 340)
  }

  if (!open || !pending) return null

  const { booking, amount } = pending
  const trip = booking?.trip
  const isUrgent = timeLeft <= 300 // dưới 5 phút

  return (
    <div
      className={`pending-payment-toast${visible ? ' is-visible' : ''}${collapsed ? ' is-collapsed' : ''}${isUrgent ? ' is-urgent' : ''}`}
      role="complementary"
      aria-label="Vé đang chờ thanh toán"
    >
      {/* Header luôn hiện – bấm để thu/mở */}
      <div className="pending-payment-toast__header" onClick={() => setCollapsed((c) => !c)}>
        <div className="pending-payment-toast__title">
          <FiCreditCard className="pending-payment-toast__title-icon" />
          <span>Vé chờ thanh toán</span>
        </div>
        <div className="pending-payment-toast__header-right">
          <span className={`pending-payment-toast__countdown${isUrgent ? ' is-urgent' : ''}`}>
            <FiClock />
            {formatTimer(timeLeft)}
          </span>
          <button
            className="pending-payment-toast__toggle"
            type="button"
            onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c) }}
            aria-label={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <button
            className="pending-payment-toast__close"
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClose() }}
            aria-label="Đóng"
          >
            <FiX />
          </button>
        </div>
      </div>

      {/* Body – ẩn khi thu gọn */}
      <div className="pending-payment-toast__body">
        <div className="pending-payment-toast__amount">
          Tổng tiền: <strong>{formatPrice(amount)}</strong>
        </div>

        <div className="pending-payment-toast__trip">
          <div className="pending-payment-toast__trip-row">
            <FaBus className="pending-payment-toast__trip-icon" />
            <span><strong>{trip?.operator || '—'}</strong> · {trip?.busType || '—'}</span>
          </div>
          {booking?.date && (
            <div className="pending-payment-toast__trip-row">
              <FiClock className="pending-payment-toast__trip-icon" />
              <span>{formatDate(booking.date)} · {trip?.depTime || '—'} → {trip?.arrTime || '—'}</span>
            </div>
          )}
          <div className="pending-payment-toast__trip-row">
            <FiMapPin className="pending-payment-toast__trip-icon" />
            <span>{booking?.pickup?.name || trip?.depPoint || '—'} → {booking?.dropoff?.name || trip?.arrPoint || '—'}</span>
          </div>
        </div>

        <div className="pending-payment-toast__actions">
          <button
            className="pending-payment-toast__btn pending-payment-toast__btn--ghost"
            type="button"
            onClick={() => {
              clearPending()
              setPending(null)
              handleClose()
            }}
          >
            Hủy vé
          </button>
          <button
            className="pending-payment-toast__btn pending-payment-toast__btn--primary"
            type="button"
            onClick={() => {
              handleClose()
              navigate('/checkout', { state: booking })
            }}
          >
            Tiếp tục thanh toán
          </button>
        </div>
      </div>
    </div>
  )
}

export { STORAGE_KEY as PENDING_PAYMENT_STORAGE_KEY }

