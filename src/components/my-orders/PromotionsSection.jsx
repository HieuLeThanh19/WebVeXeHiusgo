import { useState } from 'react'
import { FaCopy, FaGift, FaTag } from 'react-icons/fa'

const PROMOS = [
  {
    id: 1,
    code: 'HGSUMMER26',
    desc: 'Giảm 20% cho tất cả tuyến đường mùa hè',
    discount: '20%',
    expiry: '31/08/2026',
    minOrder: '200.000đ',
    used: false,
  },
  {
    id: 2,
    code: 'MEMBER50K',
    desc: 'Ưu đãi thành viên - giảm thẳng 50.000đ',
    discount: '50K',
    expiry: '30/09/2026',
    minOrder: '150.000đ',
    used: false,
  },
  {
    id: 3,
    code: 'VUNGTAU10',
    desc: 'Giảm 10% tuyến Vũng Tàu cuối tuần',
    discount: '10%',
    expiry: '01/07/2026',
    minOrder: '100.000đ',
    used: true,
  },
]

const LOYALTY = [
  { label: 'Tổng chuyến đi', value: '12', icon: 'BUS' },
  { label: 'Điểm tích lũy', value: '1.240', icon: 'PTS' },
  { label: 'Hạng thành viên', value: 'Bạc', icon: 'VIP' },
]

const PromotionsSection = () => {
  const [copied, setCopied] = useState(null)

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="orders-page__panel promo-section">
      <div className="promo-section__loyalty">
        {LOYALTY.map((item) => (
          <div key={item.label} className="promo-section__loyalty-card">
            <span className="promo-section__loyalty-icon">{item.icon}</span>
            <strong>{item.value}</strong>
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="promo-section__block-title">
        <FaTag /> Mã ưu đãi của bạn
      </div>

      <div className="promo-section__list">
        {PROMOS.map((promo) => (
          <div key={promo.id} className={`promo-section__coupon ${promo.used ? 'promo-section__coupon--used' : ''}`}>
            <div className="promo-section__coupon-left">
              <div className="promo-section__coupon-discount">{promo.discount}</div>
            </div>
            <div className="promo-section__coupon-body">
              <p className="promo-section__coupon-desc">{promo.desc}</p>
              <p className="promo-section__coupon-meta">
                Đơn tối thiểu {promo.minOrder} · HSD: {promo.expiry}
              </p>
              <div className="promo-section__coupon-code">
                <span>{promo.code}</span>
                <button
                  type="button"
                  className="promo-section__copy-btn"
                  onClick={() => !promo.used && handleCopy(promo.code)}
                  disabled={promo.used}
                >
                  {promo.used ? 'Đã dùng' : copied === promo.code ? 'Đã chép!' : <><FaCopy /> Sao chép</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="promo-section__enter">
        <FaGift />
        <input placeholder="Nhập mã ưu đãi..." className="promo-section__enter-input" />
        <button type="button" className="promo-section__enter-btn">
          Áp dụng
        </button>
      </div>
    </div>
  )
}

export default PromotionsSection
