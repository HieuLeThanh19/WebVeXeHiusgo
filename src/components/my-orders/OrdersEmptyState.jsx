import { FaBus } from 'react-icons/fa'

const EMPTY_MESSAGES = {
  upcoming: { title: 'Bạn chưa có chuyến sắp đi nào', desc: 'Đặt vé ngay để bắt đầu hành trình mới.' },
  completed: { title: 'Chưa có chuyến đã hoàn thành', desc: 'Các chuyến đã hoàn thành sẽ xuất hiện ở đây.' },
  cancelled: { title: 'Không có vé nào bị hủy', desc: 'Các vé đã hủy sẽ được hiển thị tại đây.' },
}

const OrdersEmptyState = ({ tab, onBook }) => {
  const { title, desc } = EMPTY_MESSAGES[tab]

  return (
    <div className="orders-page__empty">
      <div className="orders-page__empty-icon">DH</div>
      <p className="orders-page__empty-title">{title}</p>
      <p className="orders-page__empty-desc">{desc}</p>
      {tab === 'upcoming' && (
        <button className="orders-page__empty-cta" onClick={onBook} type="button">
          <FaBus /> Đặt chuyến đi ngay
        </button>
      )}
    </div>
  )
}

export default OrdersEmptyState
