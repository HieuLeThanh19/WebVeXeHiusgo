import { useEffect, useState } from 'react'
import SearchBox from '../components/home/SearchBox'
import PopularRoutes from '../components/home/PopularRoutes'
import TickerRoutes from '../components/home/TickerRoutes'
import { useLanguage } from '../i18n/LanguageContext'
const heroBanners = [
  '/picture/20260408_1518_image.png',
  '/picture/20260408_1518_image (1).png',
  '/picture/20260408_1518_image (2).png',
  '/picture/20260408_1518_image (3).png',
]

const Home = () => {
  const [activeBanner, setActiveBanner] = useState(0)
  const { t } = useLanguage()

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
            <div className="feature-card">
              <h3>{t('home.features.routesTitle')}</h3>
              <p>{t('home.features.routesDescription')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('home.features.paymentTitle')}</h3>
              <p>{t('home.features.paymentDescription')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('home.features.bookingTitle')}</h3>
              <p>{t('home.features.bookingDescription')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('home.features.securityTitle')}</h3>
              <p>{t('home.features.securityDescription')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
