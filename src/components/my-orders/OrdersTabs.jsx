const OrdersTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="orders-page__tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`orders-page__tab${activeTab === tab.key ? ' orders-page__tab--active' : ''}`}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default OrdersTabs
