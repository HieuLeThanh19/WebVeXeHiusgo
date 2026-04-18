import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa'
import { t } from '../../content/siteText'
import '../../styles/footer.scss'

const SiteFooterFixed = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo-wrapper">
              <h3 className="footer-logo">HiusGo</h3>
            </div>

            <div className="payment-section">
              <h4>{t('footer.paymentPartners')}</h4>
              <div className="payment-icons">
                <div className="payment-badge">VISA</div>
                <div className="payment-badge">Mastercard</div>
                <div className="payment-badge">JCB</div>
                <div className="payment-badge">Momo</div>
                <div className="payment-badge">ZaloPay</div>
                <div className="payment-badge">VNPay</div>
                <div className="payment-badge">OnePay</div>
                <div className="payment-badge">ShopeePay</div>
              </div>
            </div>

            <div className="security-section">
              <h4>{t('footer.certifications')}</h4>
              <div className="security-badges">
                <img src="/picture/footer-cert-2.png" alt={t('footer.certTrade')} />
                <img src="/picture/footer-cert-5.png" alt={t('footer.certSecurity')} />
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4>{t('footer.aboutUs')}</h4>
            <ul>
              <li><a href="#">{t('footer.aboutLinks.intro')}</a></li>
              <li><a href="#">{t('footer.aboutLinks.careers')}</a></li>
              <li><a href="#">{t('footer.aboutLinks.news')}</a></li>
              <li><a href="#">{t('footer.aboutLinks.contact')}</a></li>
            </ul>

            <h4 className="section-title-space">{t('footer.followUs')}</h4>
            <div className="social-links">
              <a href="#" className="social-link">
                <FaFacebook className="social-icon" /> Facebook
              </a>
              <a href="#" className="social-link">
                <FaTiktok className="social-icon" /> TikTok
              </a>
              <a href="#" className="social-link">
                <FaYoutube className="social-icon" /> YouTube
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>{t('footer.support')}</h4>
            <ul>
              <li><a href="#">{t('footer.supportLinks.paymentGuide')}</a></li>
              <li><a href="#">{t('footer.supportLinks.regulations')}</a></li>
              <li><a href="#">{t('footer.supportLinks.privacy')}</a></li>
              <li><a href="#">{t('footer.supportLinks.cancellation')}</a></li>
              <li><a href="#">{t('footer.supportLinks.disputes')}</a></li>
              <li><a href="#">{t('footer.supportLinks.faq')}</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t('footer.partnerSolutions')}</h4>
            <ul>
              <li><a href="#">{t('footer.partnerLinks.operatorSoftware')}</a></li>
              <li><a href="#">{t('footer.partnerLinks.operatorApp')}</a></li>
              <li><a href="#">{t('footer.partnerLinks.driverApp')}</a></li>
              <li><a href="#">{t('footer.partnerLinks.brandedWebsite')}</a></li>
            </ul>

            <h4 className="section-title-space">{t('footer.cargoSolutions')}</h4>
            <ul>
              <li><a href="#">{t('footer.cargoLinks.cargoSoftware')}</a></li>
              <li><a href="#">{t('footer.cargoLinks.cargoApp')}</a></li>
              <li><a href="#">{t('footer.cargoLinks.agencySoftware')}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="company-info">
            <h4>{t('footer.companyName')}</h4>
            <p>{t('footer.companyAddress')}</p>
            <p>{t('footer.office')}</p>
            <p>{t('footer.branch')}</p>
            <p>{t('footer.businessLicense')}</p>
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooterFixed
