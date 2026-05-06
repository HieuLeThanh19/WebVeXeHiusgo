import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CheckoutHeader from '../components/checkout/CheckoutHeader'
import ContactForm from '../components/checkout/ContactForm'
import ExtrasPanel from '../components/checkout/ExtrasPanel'
import TripSummary from '../components/checkout/TripSummary'
import PaymentMethods from '../components/checkout/PaymentMethods'
import PaymentSummary from '../components/checkout/PaymentSummary'
import BookingSuccess from '../components/checkout/BookingSuccess'
import AuthModal from '../components/common/AuthModal'
import { PENDING_PAYMENT_STORAGE_KEY } from '../components/common/PendingPaymentPopup'
import '../styles/checkout.scss'

const STEP_CONFIRM = 'confirm'
const STEP_PAYMENT = 'payment'
const STEP_SUCCESS = 'success'
const PAYMENT_WINDOW_MS = 30 * 60 * 1000

const readPendingPayment = () => {
  try {
    const raw = window.localStorage.getItem(PENDING_PAYMENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearPendingPayment = () => {
  window.localStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY)
}

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [bookingData, setBookingData] = useState(() => location.state || null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (bookingData) return
    const pending = readPendingPayment()
    if (pending?.booking) {
      setBookingData(pending.booking)
      setStep('payment')
      setSelectedPayment(pending.selectedPayment || 'qr')
      setPromoCode(pending.promoCode || '')
      setPromoDiscount(pending.promoDiscount || 0)
      setContactInfo(pending.contactInfo || { name: '', phone: '', email: '' })
      setExtras(pending.extras || { tripInsurance: false, accidentInsurance: false, flexiCancel: false })
      setMotoRentals(pending.motoRentals || {})
      setExpiresAt(pending.expiresAt || Date.now() + PAYMENT_WINDOW_MS)
      return
    }
    navigate('/', { replace: true })
  }, [bookingData, navigate])

  const [step, setStep] = useState(STEP_CONFIRM)
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '' })
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [extras, setExtras] = useState({
    tripInsurance: false,
    accidentInsurance: false,
    flexiCancel: false,
  })
  const [motoRentals, setMotoRentals] = useState({})
  const [selectedPayment, setSelectedPayment] = useState('qr')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + PAYMENT_WINDOW_MS)
  const [timeLeft, setTimeLeft] = useState(() => Math.floor(PAYMENT_WINDOW_MS / 1000))
  const [orderId] = useState(() => `HD${Math.floor(Math.random() * 9000000 + 1000000)}`)

  useEffect(() => {
    if (step !== STEP_PAYMENT) return
    const id = setInterval(() => {
      const remain = Math.floor((expiresAt - Date.now()) / 1000)
      setTimeLeft(remain)
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, step])

  useEffect(() => {
    if (step !== STEP_PAYMENT) return
    if (timeLeft > 0) return
    clearPendingPayment()
    window.alert('Đã hết thời gian thanh toán. Vé đã được hủy.')
    navigate('/', { replace: true })
  }, [navigate, step, timeLeft])

  if (!bookingData) return null

  const { trip, seats, totalPrice, pickup, dropoff, date } = bookingData

  const extrasTotal =
    (extras.tripInsurance ? 20000 * seats.length : 0) +
    (extras.accidentInsurance ? 15000 * seats.length : 0) +
    (extras.flexiCancel ? 25000 * seats.length : 0) +
    Object.values(motoRentals).reduce((sum, qty) => sum + qty * 180000, 0)

  const extrasBreakdown = useMemo(() => {
    const rows = []
    if (extras.tripInsurance) {
      rows.push({ key: 'tripInsurance', label: `Bảo hiểm chuyến đi (${seats.length} ghế)`, amount: 20000 * seats.length })
    }
    if (extras.accidentInsurance) {
      rows.push({ key: 'accidentInsurance', label: `Bảo hiểm tai nạn (${seats.length} ghế)`, amount: 15000 * seats.length })
    }
    if (extras.flexiCancel) {
      rows.push({ key: 'flexiCancel', label: `Hoàn huỷ linh hoạt (${seats.length} ghế)`, amount: 25000 * seats.length })
    }

    const motoOptions = {
      m1: { name: 'Thuê xe số phổ thông', price: 120000 },
      m2: { name: 'Thuê xe ga 110cc', price: 150000 },
      m3: { name: 'Thuê xe ga 125cc', price: 180000 },
    }

    Object.entries(motoRentals).forEach(([id, qty]) => {
      const count = Number(qty) || 0
      if (count <= 0) return
      const opt = motoOptions[id]
      if (!opt) return
      rows.push({
        key: `moto-${id}`,
        label: `${opt.name} × ${count}`,
        amount: opt.price * count,
      })
    })

    return rows
  }, [extras, motoRentals, seats.length])

  const finalTotal = totalPrice + extrasTotal - promoDiscount

  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const handleContinue = () => {
    setStep(STEP_PAYMENT)
    const newExpiresAt = Date.now() + PAYMENT_WINDOW_MS
    setExpiresAt(newExpiresAt)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePay = () => {
    setStep(STEP_SUCCESS)
    clearPendingPayment()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToConfirm = () => {
    setStep(STEP_CONFIRM)
    clearPendingPayment()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!bookingData) return
    if (step !== STEP_PAYMENT) return

    window.localStorage.setItem(
      PENDING_PAYMENT_STORAGE_KEY,
      JSON.stringify({
        expiresAt,
        booking: bookingData,
        contactInfo,
        extras,
        motoRentals,
        selectedPayment,
        promoCode,
        promoDiscount,
        amount: finalTotal,
      })
    )
  }, [
    bookingData,
    contactInfo,
    expiresAt,
    extras,
    finalTotal,
    motoRentals,
    promoCode,
    promoDiscount,
    selectedPayment,
    step,
  ])

  if (step === STEP_SUCCESS) {
    return (
      <>
        <BookingSuccess
          orderId={orderId}
          trip={trip}
          seats={seats}
          pickup={pickup}
          dropoff={dropoff}
          date={date}
          finalTotal={finalTotal}
          contactInfo={contactInfo}
          onRegister={() => {
            setAuthMode('register')
            setAuthOpen(true)
          }}
        />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
      </>
    )
  }

  return (
    <>
      <div className="checkout-page">
        <CheckoutHeader
          step={step}
          timeLeft={step === STEP_PAYMENT ? formatTimer(timeLeft) : null}
          expired={timeLeft <= 0}
          onLogin={() => {
            setAuthMode('login')
            setAuthOpen(true)
          }}
        />

        <div className="checkout-page__body">
          <div className="checkout-page__layout">
            <div className="checkout-page__left">
              {step === STEP_CONFIRM ? (
                <>
                  <button
                    className="checkout-page__back-link"
                    onClick={() => navigate(-1)}
                    type="button"
                  >
                    ← Quay lại
                  </button>

                  <ContactForm
                    contactInfo={contactInfo}
                    onChange={setContactInfo}
                    onLogin={() => {
                      setAuthMode('login')
                      setAuthOpen(true)
                    }}
                  />

                  <ExtrasPanel
                    extras={extras}
                    onExtrasChange={setExtras}
                    motoRentals={motoRentals}
                    onMotoChange={setMotoRentals}
                    seatCount={seats.length}
                  />
                </>
              ) : (
                <PaymentMethods selected={selectedPayment} onChange={setSelectedPayment} />
              )}
            </div>

            <div className="checkout-page__right">
              {step === STEP_CONFIRM ? (
                <TripSummary
                  trip={trip}
                  seats={seats}
                  pickup={pickup}
                  dropoff={dropoff}
                  date={date}
                  extrasTotal={extrasTotal}
                  totalPrice={totalPrice}
                  finalTotal={finalTotal}
                  onContinue={handleContinue}
                  contactInfo={contactInfo}
                />
              ) : (
                <PaymentSummary
                  trip={trip}
                  seats={seats}
                  pickup={pickup}
                  dropoff={dropoff}
                  date={date}
                  totalPrice={totalPrice}
                  extrasTotal={extrasTotal}
                  finalTotal={finalTotal}
                  selectedPayment={selectedPayment}
                  extrasBreakdown={extrasBreakdown}
                  promoCode={promoCode}
                  onPromoChange={setPromoCode}
                  promoDiscount={promoDiscount}
                  onPromoApply={setPromoDiscount}
                  contactInfo={contactInfo}
                  onEditContact={handleBackToConfirm}
                  onPay={handlePay}
                  expired={timeLeft <= 0}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
    </>
  )
}

