import { FaSignOutAlt } from 'react-icons/fa'

const OrdersSidebar = ({ items, activeItem, onSelect, onLogout }) => {
  return (
    <aside className="orders-page__sidebar">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            className={`orders-page__sidebar-item${activeItem === item.key ? ' orders-page__sidebar-item--active' : ''}`}
            type="button"
            onClick={() => onSelect(item.key)}
          >
            <span className="orders-page__sidebar-icon">
              <Icon />
            </span>
            {item.label}
          </button>
        )
      })}
      <div className="orders-page__sidebar-divider" />
      <button className="orders-page__sidebar-item orders-page__sidebar-item--danger" type="button" onClick={onLogout}>
        <span className="orders-page__sidebar-icon">
          <FaSignOutAlt />
        </span>
        Đăng xuất
      </button>
    </aside>
  )
}

export default OrdersSidebar
