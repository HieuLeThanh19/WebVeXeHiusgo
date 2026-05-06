import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CheckoutHeader from '../components/checkout/CheckoutHeader'
import ContactForm from '../components/checkout/ContactForm'
import ExtrasPanel from '../components/checkout/ExtrasPanel'
import TripSummary from '../components/checkout/TripSummary'
import PaymentMethods from '../components/checkout/PaymentMethods'
import PaymentSummary from '../components/checkout/PaymentSummary'
import BookingSuccess from '../components/checkout/BookingSuccess'
import '../styles/checkout.scss'

const STEP_CONFIRM = 'confirm'
const STEP_PAYMENT = 'payment'
const STEP_SUCCESS = 'success'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingData = location.state

  // Nếu không có dữ liệu booking, redirect về trang chủ
  useEffect(() => {
    if (!bookingData) {
      navigate('/', { replace: true })
    }
  }, [bookingData, navigate])

  const [step, setStep] = useState(STEP_CONFIRM)
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [extras, setExtras] = useState({
    tripInsurance: false,
    accidentInsurance: false,
    flexiCancel: false,
  })
  const [motoRentals, setMotoRentals] = useState({})
  const [selectedPayment, setSelectedPayment] = useState('qr')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 37)
  const [orderId] = useState(() => 'HD' + Math.floor(Math.random() * 9000000 + 1000000))

  // Countdown timer ở bước thanh toán
  useEffect(() => {
    if (step !== STEP_PAYMENT) return
    if (timeLeft <= 0) return

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [step, timeLeft])

  if (!bookingData) return null

  const { trip, seats, totalPrice, pickup, dropoff, date } = bookingData

  // Tính extras price
  const extrasTotal =
    (extras.tripInsurance ? 20000 * seats.length : 0) +
    (extras.accidentInsurance ? 15000 * seats.length : 0) +
    (extras.flexiCancel ? 25000 * seats.length : 0) +
    Object.values(motoRentals).reduce((sum, qty) => sum + qty * 180000, 0)

  const finalTotal = totalPrice + extrasTotal - promoDiscount

  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const handleContinue = () => {
    setStep(STEP_PAYMENT)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePay = () => {
    setStep(STEP_SUCCESS)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToConfirm = () => {
    setStep(STEP_CONFIRM)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (step === STEP_SUCCESS) {
    return (
      <BookingSuccess
        orderId={orderId}
        trip={trip}
        seats={seats}
        pickup={pickup}
        dropoff={dropoff}
        date={date}
        finalTotal={finalTotal}
        contactInfo={contactInfo}
      />
    )
  }

  return (
    <div className="checkout-page">
      <CheckoutHeader
        step={step}
        timeLeft={step === STEP_PAYMENT ? formatTimer(timeLeft) : null}
        expired={timeLeft <= 0}
      />

      <div className="checkout-page__body">
        <div className="checkout-page__layout">
          {/* Cột trái */}
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
              <PaymentMethods
                selected={selectedPayment}
                onChange={setSelectedPayment}
              />
            )}
          </div>

          {/* Cột phải */}
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
  )
}
