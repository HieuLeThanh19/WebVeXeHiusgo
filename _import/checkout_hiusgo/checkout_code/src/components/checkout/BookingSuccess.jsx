import { FiCheckCircle, FiCalendar, FiMapPin, FiUser, FiArrowRight, FiClock, FiDownload, FiHome } from 'react-icons/fi'
import { FaBus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function BookingSuccess({
  orderId,
  trip,
  seats,
  pickup,
  dropoff,
  date,
  finalTotal,
  contactInfo,
}) {
  const navigate = useNavigate()

  return (
    <div className="booking-success">
      <div className="booking-success__card">
        {/* Icon thành công */}
        <div className="booking-success__icon-wrap">
          <FiCheckCircle className="booking-success__icon" />
        </div>

        <h1 className="booking-success__title">Đặt vé thành công!</h1>
        <p className="booking-success__subtitle">
          Vé của bạn đã được xác nhận. Thông tin vé đã gửi về{' '}
          <strong>{contactInfo.email || 'email của bạn'}</strong>
        </p>

        {/* Mã đơn hàng */}
        <div className="booking-success__order-id">
          <span className="booking-success__order-label">Mã đơn hàng</span>
          <span className="booking-success__order-code">{orderId}</span>
        </div>

        {/* Chi tiết chuyến */}
        <div className="booking-success__trip">
          <h3 className="booking-success__section-title">
            <FaBus /> Thông tin chuyến đi
          </h3>

          <div className="booking-success__trip-grid">
            <div className="booking-success__trip-row">
              <FiCalendar className="booking-success__trip-icon" />
              <div>
                <span className="booking-success__trip-key">Ngày đi</span>
                <span className="booking-success__trip-val">{formatDate(date)}</span>
              </div>
            </div>
            <div className="booking-success__trip-row">
              <FaBus className="booking-success__trip-icon" />
              <div>
                <span className="booking-success__trip-key">Nhà xe</span>
                <span className="booking-success__trip-val">{trip.operator} · {trip.busType}</span>
              </div>
            </div>
            <div className="booking-success__trip-row">
              <FiClock className="booking-success__trip-icon" />
              <div>
                <span className="booking-success__trip-key">Giờ khởi hành</span>
                <span className="booking-success__trip-val">{trip.depTime} → {trip.arrTime}</span>
              </div>
            </div>
            <div className="booking-success__trip-row">
              <FiMapPin className="booking-success__trip-icon" />
              <div>
                <span className="booking-success__trip-key">Điểm đón</span>
                <span className="booking-success__trip-val">{pickup?.name || trip.depPoint}</span>
              </div>
            </div>
            <div className="booking-success__trip-row">
              <FiArrowRight className="booking-success__trip-icon booking-success__trip-icon--arrow" />
              <div>
                <span className="booking-success__trip-key">Điểm trả</span>
                <span className="booking-success__trip-val">{dropoff?.name || trip.arrPoint}</span>
              </div>
            </div>
            <div className="booking-success__trip-row">
              <FiUser className="booking-success__trip-icon" />
              <div>
                <span className="booking-success__trip-key">Số ghế</span>
                <span className="booking-success__trip-val">{seats.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="booking-success__total">
            <span>Tổng tiền đã thanh toán</span>
            <span className="booking-success__total-price">{formatPrice(finalTotal)}</span>
          </div>
        </div>

        {/* Hướng dẫn tiếp theo */}
        <div className="booking-success__next-steps">
          <h3 className="booking-success__section-title">Hướng dẫn tiếp theo</h3>
          <ul className="booking-success__steps-list">
            <li>📱 Tài xế sẽ liên hệ trước <strong>30 phút</strong> khi đến điểm đón</li>
            <li>🎫 Mang theo CMND/CCCD hoặc căn cước khi lên xe</li>
            <li>⏰ Có mặt tại điểm đón trước <strong>15 phút</strong> giờ khởi hành</li>
            <li>📞 Hotline hỗ trợ: <strong>1900 1234</strong> (24/7)</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="booking-success__actions">
          <button className="booking-success__btn-download" type="button">
            <FiDownload /> Tải vé PDF
          </button>
          <button
            className="booking-success__btn-home"
            onClick={() => navigate('/')}
            type="button"
          >
            <FiHome /> Về trang chủ
          </button>
        </div>

        {/* Gợi ý tạo tài khoản */}
        <div className="booking-success__register-hint">
          <p>
            Tạo tài khoản để quản lý vé, tích điểm và nhận ưu đãi độc quyền!
          </p>
          <button className="booking-success__register-btn" type="button">
            Tạo tài khoản miễn phí
          </button>
        </div>
      </div>
    </div>
  )
}
