import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa'
import '../../styles/footer.scss'

const SiteFooter = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo-wrapper">
              <h3 className="footer-logo">HiusGo</h3>
            </div>

            <div className="payment-section">
              <h4>Đối tác thanh toán</h4>
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
              <h4>Chứng nhận & bảo mật</h4>
              <div className="security-badges">
                <img src="https://via.placeholder.com/60x40/fff/333?text=BKH" alt="Bộ Công Thương" />
                <img src="https://via.placeholder.com/60x40/fff/333?text=SSL" alt="Chứng nhận bảo mật" />
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4>Về chúng tôi</h4>
            <ul>
              <li><a href="#">Giới thiệu HiusGo</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Tin tức</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>

            <h4 className="section-title-space">Theo dõi HiusGo</h4>
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
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="#">Hướng dẫn thanh toán</a></li>
              <li><a href="#">Quy chế hoạt động</a></li>
              <li><a href="#">Chính sách bảo mật thông tin</a></li>
              <li><a href="#">Chính sách hoàn hủy</a></li>
              <li><a href="#">Giải quyết tranh chấp & khiếu nại</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Giải pháp đối tác</h4>
            <ul>
              <li><a href="#">Phần mềm quản lý nhà xe</a></li>
              <li><a href="#">Ứng dụng quản lý nhà xe</a></li>
              <li><a href="#">Ứng dụng tài xế</a></li>
              <li><a href="#">Website/App thương hiệu riêng</a></li>
            </ul>

            <h4 className="section-title-space">Giải pháp hàng hóa</h4>
            <ul>
              <li><a href="#">Phần mềm quản lý hàng hóa</a></li>
              <li><a href="#">Ứng dụng quản lý hàng hóa</a></li>
              <li><a href="#">Phần mềm đại lý</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="company-info">
            <h4>Công ty TNHH Thương mại Dịch vụ HiusGo</h4>
            <p>Địa chỉ đăng ký kinh doanh: 8C Chử Đồng Tử, Phường Tân Sơn Nhì, TP. Hồ Chí Minh, Việt Nam.</p>
            <p>Văn phòng: Lầu 2, tòa nhà H3 Circo Hoàng Diệu, 384 Hoàng Diệu, TP. Hồ Chí Minh.</p>
            <p>Chi nhánh: Tầng 3, tòa nhà 101 Láng Hạ, 101 Láng Hạ, TP. Hà Nội.</p>
            <p>Giấy chứng nhận ĐKKD số 0315133726 do Sở KH và ĐT TP. Hồ Chí Minh cấp lần đầu ngày 27/6/2018.</p>
            <p>Bản quyền © 2025 thuộc về HiusGo.com</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
