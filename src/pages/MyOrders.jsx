import { useState } from 'react'
import AccountSection from '../components/my-orders/AccountSection'
import OrdersHeader from '../components/my-orders/OrdersHeader'
import OrdersPanel from '../components/my-orders/OrdersPanel'
import OrdersSidebar from '../components/my-orders/OrdersSidebar'
import OrdersTabs from '../components/my-orders/OrdersTabs'
import PaymentSection from '../components/my-orders/PaymentSection'
import PromotionsSection from '../components/my-orders/PromotionsSection'
import ReviewsSection from '../components/my-orders/ReviewsSection'
import { MOCK_ORDERS, SIDEBAR_ITEMS, TABS } from '../components/my-orders/constants'
import '../styles/orders.scss'

const MyOrders = () => {
  const [activeSection, setActiveSection] = useState('orders')
  const [activeTab, setActiveTab] = useState('upcoming')
  const orders = MOCK_ORDERS[activeTab] || []

  const handleBook = () => {
    window.location.href = '/'
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return (
          <>
            <OrdersTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            <OrdersPanel activeTab={activeTab} orders={orders} onBook={handleBook} />
          </>
        )
      case 'account':
        return <AccountSection />
      case 'payment':
        return <PaymentSection />
      case 'promotions':
        return <PromotionsSection />
      case 'reviews':
        return <ReviewsSection />
      default:
        return null
    }
  }

  return (
    <div className="orders-page">
      <OrdersHeader />
      <div className="orders-page__wrapper">
        <OrdersSidebar
          items={SIDEBAR_ITEMS}
          activeItem={activeSection}
          onSelect={setActiveSection}
          onLogout={() => setActiveSection('orders')}
        />
        <main className="orders-page__content">{renderContent()}</main>
      </div>
    </div>
  )
}

export default MyOrders
