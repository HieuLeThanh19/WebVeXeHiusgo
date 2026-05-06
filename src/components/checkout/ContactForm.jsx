import { useState } from 'react'
import { FiUser, FiMail, FiInfo, FiLogIn } from 'react-icons/fi'

export default function ContactForm({ contactInfo, onChange, onLogin }) {
  const [errors, setErrors] = useState({})

  const isValidEmail = (email) => {
    const value = String(email ?? '').trim()
    // Email validation vừa phải (đủ cho UI), không "khắt khe" quá.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const validate = (field, value) => {
    const trimmed = typeof value === 'string' ? value.trim() : value
    setErrors((prev) => {
      const next = { ...prev }
      if (field === 'name') {
        next.name = trimmed.length < 2 ? 'Vui lòng nhập tên người đi' : ''
      }
      if (field === 'phone') {
        next.phone = !/^(0|\\+84)[0-9]{8,10}$/.test(String(trimmed).replace(/\\s/g, ''))
          ? 'Số điện thoại không hợp lệ'
          : ''
      }
      if (field === 'email') {
        next.email = !isValidEmail(trimmed)
          ? 'Email không hợp lệ'
          : ''
      }
      return next
    })
  }

  const handleChange = (field, value) => {
    onChange({ ...contactInfo, [field]: value })
    validate(field, value)
  }

  return (
    <div className="checkout-card">
      <div className="checkout-login-hint">
        <div className="checkout-login-hint__text">
          <FiLogIn />
          <span>Đăng nhập để tự điền thông tin và tích điểm thưởng</span>
        </div>
        <button className="checkout-login-hint__btn" type="button" onClick={onLogin}>
          Đăng nhập
        </button>
      </div>

      <h2 className="checkout-card__title">
        <FiUser />
        Thông tin liên hệ
      </h2>

      <div className="checkout-form">
        <div className={`checkout-field ${errors.name ? 'has-error' : ''}`}>
          <label className="checkout-field__label">
            Tên người đi <span className="checkout-field__required">*</span>
          </label>
          <div className="checkout-field__input-wrap">
            <FiUser className="checkout-field__icon" />
            <input
              className="checkout-field__input"
              type="text"
              placeholder="Họ và tên"
              value={contactInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="checkout-field__error">{errors.name}</p>}
        </div>

        <div className={`checkout-field ${errors.phone ? 'has-error' : ''}`}>
          <label className="checkout-field__label">
            Số điện thoại <span className="checkout-field__required">*</span>
          </label>
          <div className="checkout-field__input-wrap checkout-field__input-wrap--phone">
            <span className="checkout-field__phone-prefix">🇻🇳 +84</span>
            <input
              className="checkout-field__input"
              type="tel"
              placeholder="Số điện thoại"
              value={contactInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              autoComplete="tel"
            />
          </div>
          {errors.phone && <p className="checkout-field__error">{errors.phone}</p>}
        </div>

        <div className={`checkout-field ${errors.email ? 'has-error' : ''}`}>
          <label className="checkout-field__label">
            Email nhận vé <span className="checkout-field__required">*</span>
          </label>
          <div className="checkout-field__input-wrap">
            <FiMail className="checkout-field__icon" />
            <input
              className="checkout-field__input"
              type="email"
              placeholder="email@example.com"
              value={contactInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="checkout-field__error">{errors.email}</p>}
        </div>
      </div>

      <p className="checkout-form__note">
        <FiInfo />
        Thông tin đơn hàng sẽ được gửi đến số điện thoại và email bạn cung cấp
      </p>
    </div>
  )
}

