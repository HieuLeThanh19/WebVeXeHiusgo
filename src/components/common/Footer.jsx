import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa'
import '../../styles/footer.scss'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Column 1 - Logo & Payment */}
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
              <h4>Đã đăng ký bản quyền</h4>
              <div className="security-badges">
                <img src="/picture/footer-cert-2.png" alt="Bộ Công Thương" />
                <img src="/picture/footer-cert-5.png" alt="Chứng nhận an toàn" />
              </div>
            </div>
          </div>

          {/* Column 2 - About Us */}
          <div className="footer-section">
            <h4>Về chúng tôi</h4>
            <ul>
              <li><a href="#">Giới thiệu HiusGo.com</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Tin tức</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>

            <h4 className="section-title-space">Theo dõi chúng tôi trên</h4>
            <div className="social-links">
              <a href="#" className="social-link">
                <FaFacebook className="social-icon" /> Facebook
              </a>
              <a href="#" className="social-link">
                <FaTiktok className="social-icon" /> Tiktok
              </a>
              <a href="#" className="social-link">
                <FaYoutube className="social-icon" /> Youtube
              </a>
            </div>
          </div>

          {/* Column 3 - Support */}
          <div className="footer-section">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="#">Hướng dẫn thanh toán</a></li>
              <li><a href="#">Quy chế HiusGo.com</a></li>
              <li><a href="#">Chính sách bảo mật thông tin</a></li>
              <li><a href="#">Chính sách bảo mật thanh toán</a></li>
              <li><a href="#">Chính sách và quy trình giải quyết tranh chấp, khiếu nại</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Column 4 - Partners */}
          <div className="footer-section">
            <h4>Trở thành đối tác</h4>
            <ul>
              <li><a href="#">Phần mềm quản lý nhà xe</a></li>
              <li><a href="#">App quản lý nhà xe</a></li>
              <li><a href="#">App tài xế</a></li>
              <li><a href="#">Website / App thương hiệu riêng cho nhà xe</a></li>
            </ul>

            <h4 className="section-title-space">Phần mềm quản lý hàng hóa</h4>
            <ul>
              <li><a href="#">Phần mềm quản lý hàng hóa</a></li>
              <li><a href="#">App quản lý hàng hóa</a></li>
              <li><a href="#">Phần mềm đại lý</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="company-info">
            <h4>Công ty TNHH Thương Mại Dịch Vụ HiusGo</h4>
            <p>Địa chỉ đăng ký kinh doanh: 8C Chữ Đồng Tử, Phường Tân Sơn Nhì, TP. Hồ Chí Minh, Việt Nam</p>
            <p>Địa chỉ: Lầu 2, tòa nhà H3 Circo Hoàng Diệu, 384 Hoàng Diệu, Phường Khánh Hải, TP. Hồ Chí Minh, Việt Nam</p>
            <p>Tầng 3, tòa nhà 101 Láng Hạ, 101 Láng Hạ, Phường Láng Hạ, TP. Hà Nội, Việt Nam</p>
            <p>Giấy chứng nhận ĐKKD số 0315133726 do Sở KH và ĐT TP. Hồ Chí Minh cấp lần đầu ngày 27/6/2018</p>
            <p>Bản quyền © 2025 thuộc về HiusGo.com</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
