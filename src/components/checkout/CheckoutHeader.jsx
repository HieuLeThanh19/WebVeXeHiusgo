import { Link } from 'react-router-dom'
import { FiShield, FiPhone, FiUser, FiClock, FiAlertTriangle } from 'react-icons/fi'

export default function CheckoutHeader({ step, timeLeft, expired, onLogin }) {
  return (
    <header className="checkout-header">
      <div className="checkout-header__inner">
        <Link to="/" className="checkout-header__logo" aria-label="HiusGo">
          <span className="checkout-header__logo-text">hiusgo</span>
          <span className="checkout-header__logo-dot">.</span>
        </Link>

        <div className="checkout-header__trust">
          <span className="checkout-header__trust-item">
            <FiShield />
            Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ
          </span>
        </div>

        <div className="checkout-header__right">
          <a href="tel:19001234" className="checkout-header__hotline">
            <FiPhone />
            <span>1900 1234</span>
          </a>
          <button className="checkout-header__login" type="button" onClick={onLogin}>
            <FiUser />
            Đăng nhập
          </button>
        </div>
      </div>

      <div className="checkout-header__progress">
        <div className="checkout-header__progress-inner">
          <div className={`checkout-step ${step === 'confirm' ? 'is-active' : 'is-done'}`}>
            <span className="checkout-step__num">{step !== 'confirm' ? '✓' : '1'}</span>
            <span className="checkout-step__label">Xác nhận thông tin</span>
          </div>
          <div className="checkout-step__line" />
          <div className={`checkout-step ${step === 'payment' ? 'is-active' : step === 'success' ? 'is-done' : ''}`}>
            <span className="checkout-step__num">{step === 'success' ? '✓' : '2'}</span>
            <span className="checkout-step__label">Thanh toán</span>
          </div>
        </div>

        {timeLeft && (
          <div className={`checkout-header__timer${expired ? ' is-expired' : ''}`}>
            {expired ? (
              <>
                <FiAlertTriangle />
                <span>Hết thời gian thanh toán</span>
              </>
            ) : (
              <>
                <FiClock />
                <span>Thời gian còn lại</span>
                <strong>{timeLeft}</strong>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

