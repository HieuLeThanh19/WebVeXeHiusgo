import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBus } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { HiOutlineShieldCheck, HiOutlineTag, HiOutlineTicket } from 'react-icons/hi'
import { getPopularRoutes } from '../../services/supabaseClient'

const promoBanners = [
  '/picture/20260409_0015_image.png',
  '/picture/20260409_0016_image.png',
  '/picture/20260409_0016_image (1).png',
  '/picture/20260409_0017_image.png',
  '/picture/20260409_0019_image.png',
  '/picture/1775668820107.png_image.png',
]

const copy = {
  platformTitle: 'Nền tảng đặt vé thông minh cho mọi hành trình',
  promoEyebrow: 'Ưu đãi nổi bật',
  promoTitle: 'Banner khuyến mãi và voucher đang áp dụng',
  promoPrevious: 'Banner trước',
  promoNext: 'Banner tiếp theo',
  bannerNavigation: 'Điều hướng banner',
  promoImageAlt: 'Banner ưu đãi',
  highlights: {
    operatorsTitle: 'Kết nối nhà xe uy tín',
    operatorsDescription: 'Tổng hợp nhiều nhà xe chất lượng trên cùng một nền tảng để bạn dễ dàng so sánh và lựa chọn.',
    bookingTitle: 'Đặt chỗ nhanh gọn',
    bookingDescription: 'Tìm chuyến, chọn ghế, thanh toán và nhận vé điện tử chỉ trong vài bước đơn giản.',
    availabilityTitle: 'Thông tin minh bạch',
    availabilityDescription: 'Lịch trình, giá vé, điểm đón trả và tình trạng chỗ trống được cập nhật rõ ràng.',
    offersTitle: 'Nhiều ưu đãi hấp dẫn',
    offersDescription: 'Liên tục có voucher, chương trình khuyến mãi và deal tốt cho các tuyến phổ biến.',
  },
}

const PopularRoutes = () => {
  const [routes, setRoutes] = useState([])
  const [activeBanner, setActiveBanner] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [slidesPerView, setSlidesPerView] = useState(3)
  const navigate = useNavigate()
  const resumeTimeoutRef = useRef(null)
  const maxBannerIndex = Math.max(promoBanners.length - slidesPerView, 0)
  const platformHighlights = [
    {
      id: 'operators',
      title: copy.highlights.operatorsTitle,
      description: copy.highlights.operatorsDescription,
      icon: FaBus,
      accentClass: 'is-blue',
    },
    {
      id: 'booking',
      title: copy.highlights.bookingTitle,
      description: copy.highlights.bookingDescription,
      icon: HiOutlineTicket,
      accentClass: 'is-amber',
    },
    {
      id: 'availability',
      title: copy.highlights.availabilityTitle,
      description: copy.highlights.availabilityDescription,
      icon: HiOutlineShieldCheck,
      accentClass: 'is-green',
    },
    {
      id: 'offers',
      title: copy.highlights.offersTitle,
      description: copy.highlights.offersDescription,
      icon: HiOutlineTag,
      accentClass: 'is-rose',
    },
  ]

  useEffect(() => {
    getPopularRoutes().then(setRoutes).catch(console.error)
  }, [])

  useEffect(() => {
    const syncSlidesPerView = () => {
      if (window.innerWidth <= 768) {
        setSlidesPerView(1)
        return
      }

      if (window.innerWidth <= 1100) {
        setSlidesPerView(2)
        return
      }

      setSlidesPerView(3)
    }

    syncSlidesPerView()
    window.addEventListener('resize', syncSlidesPerView)

    return () => window.removeEventListener('resize', syncSlidesPerView)
  }, [])

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setActiveBanner((currentIndex) => Math.min(currentIndex, maxBannerIndex))
  }, [maxBannerIndex])

  useEffect(() => {
    if (maxBannerIndex === 0 || isCarouselPaused) {
      return undefined
    }

    let direction = 1

    const intervalId = window.setInterval(() => {
      setActiveBanner((currentIndex) => {
        if (currentIndex >= maxBannerIndex) {
          direction = -1
          return Math.max(maxBannerIndex - 1, 0)
        }

        if (currentIndex <= 0) {
          direction = 1
          return Math.min(1, maxBannerIndex)
        }

        return currentIndex + direction
      })
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [isCarouselPaused, maxBannerIndex])

  const handleClick = (route) => {
    const today = new Date().toISOString().split('T')[0]
    navigate(`/search?from=${route.origin.slug}&to=${route.destination.slug}&date=${today}`)
  }

  const showPreviousBanner = () => {
    pauseCarouselAfterInteraction()
    setActiveBanner((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  const showNextBanner = () => {
    pauseCarouselAfterInteraction()
    setActiveBanner((currentIndex) => Math.min(currentIndex + 1, maxBannerIndex))
  }

  const pauseCarouselAfterInteraction = () => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current)
    }

    setIsCarouselPaused(true)

    resumeTimeoutRef.current = window.setTimeout(() => {
      setIsCarouselPaused(false)
      resumeTimeoutRef.current = null
    }, 4000)
  }

  return (
    <section className="popular-routes">
      <div className="container">
        <div className="platform-overview">
          <div className="section-heading">
            <h2>{copy.platformTitle}</h2>
          </div>

          <div className="platform-overview__grid">
            {platformHighlights.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.id} className={`platform-overview__card ${item.accentClass}`}>
                  <div className="platform-overview__icon">
                    <Icon />
                  </div>

                  <div className="platform-overview__content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="promo-carousel">
          <div className="promo-carousel__header">
            <div>
              <span className="promo-carousel__eyebrow">{copy.promoEyebrow}</span>
              <h3>{copy.promoTitle}</h3>
            </div>

            <div className="promo-carousel__controls" aria-label={copy.bannerNavigation}>
              <button
                type="button"
                className="promo-carousel__control"
                onClick={showPreviousBanner}
                disabled={activeBanner === 0}
                aria-label={copy.promoPrevious}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="promo-carousel__control"
                onClick={showNextBanner}
                disabled={activeBanner >= maxBannerIndex}
                aria-label={copy.promoNext}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="promo-carousel__viewport">
            <div
              className="promo-carousel__track"
              style={{ transform: `translateX(-${activeBanner * (100 / slidesPerView)}%)` }}
            >
              {promoBanners.map((banner, index) => (
                <article key={banner} className="promo-carousel__slide">
                  <img
                    src={banner}
                    alt={`${copy.promoImageAlt} ${index + 1}`}
                    className="promo-carousel__image"
                    loading="lazy"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="routes-grid">
          {routes.map((route) => (
            <button key={route.id} onClick={() => handleClick(route)} className="route-link">
              {route.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularRoutes
