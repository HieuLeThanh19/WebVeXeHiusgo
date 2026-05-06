import { FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useState } from 'react'

import logoQr from '../../assets/payments/qr.svg'
import logoMomo from '../../assets/payments/momo.svg'
import logoZaloPay from '../../assets/payments/zalopay.svg'
import logoShopeePay from '../../assets/payments/shopeepay.svg'
import logoVnPay from '../../assets/payments/vnpay.svg'
import logoAtm from '../../assets/payments/atm.svg'
import logoVisa from '../../assets/payments/visa.svg'
import logoCash from '../../assets/payments/cash.svg'

const PAYMENT_METHODS = [
  {
    id: 'qr',
    label: 'QR chuyển khoản / Ví điện tử',
    desc: 'Không cần nhập thông tin. Xác nhận thanh toán tức thì.',
    logo: logoQr,
    sub: ['MoMo', 'ZaloPay', 'ViettelPay', 'VNPay'],
    promo: null,
  },
  {
    id: 'momo',
    label: 'Ví MoMo',
    desc: 'Thanh toán qua ứng dụng MoMo',
    logo: logoMomo,
    promo: 'Giảm 10% tối đa 30.000đ cho đơn từ 150.000đ',
  },
  {
    id: 'zalopay',
    label: 'Ví ZaloPay',
    desc: 'Thanh toán qua ứng dụng ZaloPay',
    logo: logoZaloPay,
    promo: 'Giảm 15k cho đơn đầu tiên trong tháng',
  },
  {
    id: 'shopeepay',
    label: 'Ví ShopeePay',
    desc: 'Liên kết ví ShopeePay để thanh toán',
    logo: logoShopeePay,
    promo: 'Hoàn xu 5% khi thanh toán qua ShopeePay',
  },
  {
    id: 'vnpay',
    label: 'VNPAY-QR',
    desc: 'Quét mã QR từ ứng dụng ngân hàng hỗ trợ VNPAY',
    logo: logoVnPay,
    promo: 'Mã HD Saigon: Giảm 50k cho đơn trên 250k',
  },
  {
    id: 'atm',
    label: 'Thẻ ATM / Internet Banking',
    desc: 'Thanh toán qua thẻ nội địa hoặc Internet Banking',
    logo: logoAtm,
    promo: null,
  },
  {
    id: 'visa',
    label: 'Thẻ quốc tế (Visa, MasterCard, JCB)',
    desc: 'Thanh toán an toàn qua cổng thanh toán quốc tế',
    logo: logoVisa,
    promo: null,
  },
  {
    id: 'onbus',
    label: 'Thanh toán khi lên xe',
    desc: 'Trả tiền mặt hoặc chuyển khoản trực tiếp cho tài xế',
    logo: logoCash,
    promo: null,
  },
]

export default function PaymentMethods({ selected, onChange }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? PAYMENT_METHODS : PAYMENT_METHODS.slice(0, 4)

  return (
    <div className="checkout-card checkout-payments">
      <h2 className="checkout-card__title">💳 Phương thức thanh toán</h2>

      <div className="checkout-payments__list">
        {displayed.map((method) => (
          <label
            key={method.id}
            className={`checkout-payment-item ${selected === method.id ? 'is-selected' : ''}`}
            htmlFor={`pay-${method.id}`}
          >
            <img className="checkout-payment-item__logo" src={method.logo} alt={method.label} />
            <div className="checkout-payment-item__body">
              <div className="checkout-payment-item__row">
                <span className="checkout-payment-item__label">{method.label}</span>
                {method.sub && (
                  <span className="checkout-payment-item__sub">{method.sub.join(' · ')}</span>
                )}
              </div>
              <p className="checkout-payment-item__desc">{method.desc}</p>
              {method.promo && <p className="checkout-payment-item__promo">🎁 {method.promo}</p>}
            </div>
            <span className="checkout-payment-item__radio">
              {selected === method.id && <FiCheck />}
            </span>
            <input
              id={`pay-${method.id}`}
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selected === method.id}
              onChange={() => onChange(method.id)}
              className="checkout-payment-item__input"
            />
          </label>
        ))}
      </div>

      {!showAll && PAYMENT_METHODS.length > 4 && (
        <button
          className="checkout-payments__show-more"
          onClick={() => setShowAll(true)}
          type="button"
        >
          <FiChevronDown /> Xem thêm {PAYMENT_METHODS.length - 4} phương thức
        </button>
      )}
      {showAll && (
        <button
          className="checkout-payments__show-more"
          onClick={() => setShowAll(false)}
          type="button"
        >
          <FiChevronUp /> Thu gọn
        </button>
      )}
    </div>
  )
}

