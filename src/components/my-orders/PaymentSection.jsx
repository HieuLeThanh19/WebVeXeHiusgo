import { useState } from 'react'
import { FaCheckCircle, FaCreditCard, FaPlus, FaTrash } from 'react-icons/fa'

const MOCK_CARDS = [
  { id: 1, type: 'Visa', last4: '4242', name: 'NGUYEN VAN AN', expiry: '08/27', isDefault: true },
  { id: 2, type: 'Mastercard', last4: '9876', name: 'NGUYEN VAN AN', expiry: '03/26', isDefault: false },
]

const MOCK_HISTORY = [
  { id: 'TT-001', desc: 'Vé xe TP.HCM → Đà Lạt', amount: '340.000đ', date: '10/07/2026', status: 'success' },
  { id: 'TT-002', desc: 'Vé xe TP.HCM → Vũng Tàu', amount: '130.000đ', date: '18/07/2026', status: 'success' },
  { id: 'TT-003', desc: 'Hoàn vé TP.HCM → Phan Thiết', amount: '-150.000đ', date: '14/05/2026', status: 'refund' },
]

const PaymentSection = () => {
  const [cards, setCards] = useState(MOCK_CARDS)

  const handleRemove = (id) => setCards((prev) => prev.filter((card) => card.id !== id))
  const handleDefault = (id) => setCards((prev) => prev.map((card) => ({ ...card, isDefault: card.id === id })))

  return (
    <div className="orders-page__panel pay-section">
      <div className="pay-section__block-title">
        <FaCreditCard /> Thẻ và tài khoản đã lưu
      </div>

      <div className="pay-section__cards">
        {cards.map((card) => (
          <div key={card.id} className={`pay-section__card ${card.isDefault ? 'pay-section__card--default' : ''}`}>
            <div className="pay-section__card-chip" />
            <div className="pay-section__card-top">
              <span className="pay-section__card-type">{card.type}</span>
              {card.isDefault && (
                <span className="pay-section__card-default-badge">
                  <FaCheckCircle /> Mặc định
                </span>
              )}
            </div>
            <div className="pay-section__card-number">•••• •••• •••• {card.last4}</div>
            <div className="pay-section__card-info">
              <span>{card.name}</span>
              <span>{card.expiry}</span>
            </div>
            <div className="pay-section__card-actions">
              {!card.isDefault && (
                <button className="pay-section__card-btn" type="button" onClick={() => handleDefault(card.id)}>
                  Đặt mặc định
                </button>
              )}
              <button
                className="pay-section__card-btn pay-section__card-btn--remove"
                type="button"
                onClick={() => handleRemove(card.id)}
                title="Xóa thẻ"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        <button className="pay-section__add-card" type="button">
          <FaPlus />
          <span>Thêm thẻ mới</span>
        </button>
      </div>

      <div className="pay-section__block-title pay-section__history-title">Lịch sử thanh toán</div>
      <div className="pay-section__history">
        {MOCK_HISTORY.map((tx) => (
          <div key={tx.id} className="pay-section__tx-row">
            <div className="pay-section__tx-info">
              <p className="pay-section__tx-desc">{tx.desc}</p>
              <p className="pay-section__tx-date">
                {tx.date} · #{tx.id}
              </p>
            </div>
            <span
              className={`pay-section__tx-amount ${
                tx.status === 'refund' ? 'pay-section__tx-amount--refund' : 'pay-section__tx-amount--success'
              }`}
            >
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaymentSection
