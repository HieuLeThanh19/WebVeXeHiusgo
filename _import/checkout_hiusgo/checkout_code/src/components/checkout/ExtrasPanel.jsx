import { FiShield, FiCheckCircle, FiRefreshCw, FiTruck } from 'react-icons/fi'

const INSURANCE_OPTIONS = [
  {
    key: 'tripInsurance',
    icon: <FiShield />,
    title: 'Bảo hiểm chuyến đi',
    price: 20000,
    description: 'Được bồi thường lên đến 400.000.000đ/chỗ (do Bảo Việt cung cấp)',
    badge: 'Khuyến nghị',
  },
  {
    key: 'accidentInsurance',
    icon: <FiCheckCircle />,
    title: 'Bảo hiểm tai nạn',
    price: 15000,
    description: 'Hỗ trợ chi phí y tế, bồi thường tai nạn trong suốt hành trình',
  },
  {
    key: 'flexiCancel',
    icon: <FiRefreshCw />,
    title: 'Chính sách hoàn hủy linh hoạt',
    price: 25000,
    description: 'Hoàn 80% vé nếu hủy trước 24h khởi hành',
  },
]

const MOTO_OPTIONS = [
  { id: 'm1', name: 'Xe số phổ thông', price: 120000, emoji: '🛵' },
  { id: 'm2', name: 'Xe ga 110cc', price: 150000, emoji: '🏍️' },
  { id: 'm3', name: 'Xe ga 125cc', price: 180000, emoji: '🏍️' },
]

const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ'

export default function ExtrasPanel({ extras, onExtrasChange, motoRentals, onMotoChange, seatCount }) {
  const toggleExtra = (key) => {
    onExtrasChange({ ...extras, [key]: !extras[key] })
  }

  const setMoto = (id, delta) => {
    const current = motoRentals[id] || 0
    const next = Math.max(0, current + delta)
    onMotoChange({ ...motoRentals, [id]: next })
  }

  return (
    <div className="checkout-card checkout-extras">
      <h2 className="checkout-card__title">
        <FiShield />
        Tiện ích & Bảo hiểm
      </h2>

      <div className="checkout-extras__list">
        {INSURANCE_OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={`checkout-extra-item ${extras[opt.key] ? 'is-checked' : ''}`}
            htmlFor={`extra-${opt.key}`}
          >
            <div className="checkout-extra-item__icon">{opt.icon}</div>
            <div className="checkout-extra-item__body">
              <div className="checkout-extra-item__header">
                <span className="checkout-extra-item__title">
                  {opt.title}
                  {opt.badge && (
                    <span className="checkout-extra-item__badge">{opt.badge}</span>
                  )}
                </span>
                <span className="checkout-extra-item__price">
                  +{formatPrice(opt.price * seatCount)}
                </span>
              </div>
              <p className="checkout-extra-item__desc">{opt.description}</p>
            </div>
            <input
              id={`extra-${opt.key}`}
              type="checkbox"
              className="checkout-extra-item__checkbox"
              checked={extras[opt.key]}
              onChange={() => toggleExtra(opt.key)}
            />
          </label>
        ))}
      </div>

      {/* Thuê xe máy */}
      <div className="checkout-moto">
        <div className="checkout-moto__header">
          <FiTruck />
          <div>
            <p className="checkout-moto__title">Thuê xe máy tại điểm đến</p>
            <p className="checkout-moto__subtitle">Giao tận nơi · Nhận tại bến xe · Giá/ngày</p>
          </div>
        </div>

        <div className="checkout-moto__grid">
          {MOTO_OPTIONS.map((moto) => {
            const qty = motoRentals[moto.id] || 0
            return (
              <div key={moto.id} className={`checkout-moto-card ${qty > 0 ? 'is-selected' : ''}`}>
                <span className="checkout-moto-card__emoji">{moto.emoji}</span>
                <p className="checkout-moto-card__name">{moto.name}</p>
                <p className="checkout-moto-card__price">{formatPrice(moto.price)}/ngày</p>
                <div className="checkout-moto-card__counter">
                  <button
                    className="checkout-moto-card__btn"
                    onClick={() => setMoto(moto.id, -1)}
                    disabled={qty === 0}
                    type="button"
                  >
                    −
                  </button>
                  <span className="checkout-moto-card__qty">{qty}</span>
                  <button
                    className="checkout-moto-card__btn checkout-moto-card__btn--add"
                    onClick={() => setMoto(moto.id, 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
