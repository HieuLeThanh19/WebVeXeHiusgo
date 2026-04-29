import { FaArrowRight, FaBus, FaCalendarAlt, FaChair, FaClock, FaTicketAlt } from 'react-icons/fa'
import { STATUS_MAP } from './constants'

const OrderCard = ({ order }) => {
  const status = STATUS_MAP[order.status]

  return (
    <article className="orders-page__order-card">
      <div>
        <div className="orders-page__order-route">
          <span className="orders-page__order-from">{order.from}</span>
          <FaArrowRight className="orders-page__order-arrow" />
          <span className="orders-page__order-to">{order.to}</span>
        </div>
        <div className="orders-page__order-id">Mã đơn: {order.id}</div>
        <div className="orders-page__order-meta">
          <span>
            <FaCalendarAlt /> {order.date}
          </span>
          <span>
            <FaClock /> {order.time}
          </span>
          <span>
            <FaChair /> Ghế: {order.seat}
          </span>
          <span>
            <FaTicketAlt /> {order.price}
          </span>
        </div>
      </div>
      <div className="orders-page__order-actions">
        <span className={`orders-page__order-status ${status.className}`}>
          <FaBus /> {status.label}
        </span>
        <button className="orders-page__btn-detail" type="button">
          Xem chi tiết
        </button>
        {order.status === 'upcoming' && (
          <button className="orders-page__btn-cancel" type="button">
            Hủy vé
          </button>
        )}
      </div>
    </article>
  )
}

export default OrderCard
