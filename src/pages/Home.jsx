import { useEffect, useState } from 'react'
import { HiOutlineCreditCard, HiOutlineMap, HiOutlineShieldCheck, HiOutlineTicket } from 'react-icons/hi'
import SearchBox from '../components/home/SearchBox'
import PopularRoutes from '../components/home/PopularRoutes'
import TickerRoutes from '../components/home/TickerRoutes'
import { t } from '../content/siteText'

const heroBanners = [
  '/picture/20260408_1518_image.png',
  '/picture/20260408_1518_image (1).png',
  '/picture/20260408_1518_image (2).png',
  '/picture/20260408_1518_image (3).png',
]

const Home = () => {
  const [activeBanner, setActiveBanner] = useState(0)
  const homeFeatures = [
    {
      id: 'routes',
      title: t('home.features.routesTitle'),
      description: t('home.features.routesDescription'),
      icon: HiOutlineMap,
    },
    {
      id: 'payment',
      title: t('home.features.paymentTitle'),
      description: t('home.features.paymentDescription'),
      icon: HiOutlineCreditCard,
    },
    {
      id: 'booking',
      title: t('home.features.bookingTitle'),
      description: t('home.features.bookingDescription'),
      icon: HiOutlineTicket,
    },
    {
      id: 'security',
      title: t('home.features.securityTitle'),
      description: t('home.features.securityDescription'),
      icon: HiOutlineShieldCheck,
    },
  ]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveBanner((currentBanner) => (currentBanner + 1) % heroBanners.length)
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="home-page">
      <TickerRoutes />
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-copy">
              <span className="hero-kicker">{t('home.kicker')}</span>
              <h1 className="hero-title">{t('home.title')}</h1>
              <p className="hero-subtitle">{t('home.subtitle')}</p>

              <div className="hero-highlights">
                <div className="hero-highlight">
                  <strong>1.000+</strong>
                  <span>{t('home.connectedRoutes')}</span>
                </div>
                <div className="hero-highlight">
                  <strong>24/7</strong>
                  <span>{t('home.support')}</span>
                </div>
              </div>

              <SearchBox />
            </div>

            <div className="hero-banner-panel">
              <div className="hero-slider" aria-hidden="true">
                {heroBanners.map((banner, index) => (
                  <div
                    key={banner}
                    className={`hero-slide${index === activeBanner ? ' is-active' : ''}`}
                    style={{ backgroundImage: `url("${banner}")` }}
                  />
                ))}
              </div>

              <div className="hero-banner-caption">
                <span>{t('home.bannerEyebrow')}</span>
                <strong>{t('home.bannerTitle')}</strong>
              </div>

              <div className="hero-indicators" aria-label={t('home.bannerNavigation')}>
                {heroBanners.map((banner, index) => (
                  <button
                    key={banner}
                    type="button"
                    className={`hero-indicator${index === activeBanner ? ' is-active' : ''}`}
                    onClick={() => setActiveBanner(index)}
                    aria-label={t('home.bannerItem', { index: index + 1 })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PopularRoutes />

      <section className="features-section">
        <div className="container">
          <h2>{t('home.whyChoose')}</h2>
          <div className="features-grid">
            {homeFeatures.map((feature) => {
              const Icon = feature.icon

              return (
                <div key={feature.id} className="feature-card">
                  <div className="feature-card__icon">
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
