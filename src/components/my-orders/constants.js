import { FaBoxOpen, FaCreditCard, FaStar, FaTag, FaUser } from 'react-icons/fa'

export const SIDEBAR_ITEMS = [
  { key: 'account', icon: FaUser, label: 'Thông tin tài khoản' },
  { key: 'orders', icon: FaBoxOpen, label: 'Đơn hàng của tôi' },
  { key: 'payment', icon: FaCreditCard, label: 'Quản lý thanh toán' },
  { key: 'promotions', icon: FaTag, label: 'Ưu đãi' },
  { key: 'reviews', icon: FaStar, label: 'Đánh giá chuyến đi' },
]

export const TABS = [
  { key: 'upcoming', label: 'Hiện tại' },
  { key: 'completed', label: 'Đã đi' },
  { key: 'cancelled', label: 'Đã hủy' },
]

export const STATUS_MAP = {
  upcoming: { label: 'Sắp đi', className: 'orders-page__order-status--upcoming' },
  completed: { label: 'Đã đi', className: 'orders-page__order-status--completed' },
  cancelled: { label: 'Đã hủy', className: 'orders-page__order-status--cancelled' },
}

export const MOCK_ORDERS = {
  upcoming: [
    {
      id: 'HG-2026-001',
      from: 'TP Hồ Chí Minh',
      to: 'Đà Lạt',
      date: '12/07/2026',
      time: '07:30',
      seat: 'B12, B13',
      status: 'upcoming',
      price: '340.000đ',
    },
    {
      id: 'HG-2026-002',
      from: 'TP Hồ Chí Minh',
      to: 'Vũng Tàu',
      date: '20/07/2026',
      time: '09:00',
      seat: 'A05',
      status: 'upcoming',
      price: '130.000đ',
    },
  ],
  completed: [
    {
      id: 'HG-2026-003',
      from: 'TP Hồ Chí Minh',
      to: 'Nha Trang',
      date: '01/06/2026',
      time: '22:00',
      seat: 'C08',
      status: 'completed',
      price: '280.000đ',
    },
  ],
  cancelled: [
    {
      id: 'HG-2026-004',
      from: 'TP Hồ Chí Minh',
      to: 'Phan Thiết',
      date: '15/05/2026',
      time: '06:00',
      seat: 'A02',
      status: 'cancelled',
      price: '150.000đ',
    },
  ],
}
