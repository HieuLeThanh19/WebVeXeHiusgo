import OrderCard from './OrderCard'
import OrdersEmptyState from './OrdersEmptyState'

const OrdersPanel = ({ activeTab, orders, onBook }) => {
  if (orders.length === 0) {
    return (
      <div className="orders-page__panel">
        <OrdersEmptyState tab={activeTab} onBook={onBook} />
      </div>
    )
  }

  return (
    <div className="orders-page__panel">
      <div className="orders-page__order-list">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}

export default OrdersPanel
