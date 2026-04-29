import { useState } from 'react'
import { FaCamera, FaKey, FaSave, FaShieldAlt, FaUser } from 'react-icons/fa'

const AccountSection = () => {
  const [form, setForm] = useState({
    fullName: 'Nguyễn Văn An',
    phone: '0901 234 567',
    email: 'nguyenvanan@email.com',
    dob: '1995-08-15',
    gender: 'male',
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="orders-page__panel acc-section">
      <div className="acc-section__hero">
        <div className="acc-section__avatar-wrap">
          <div className="acc-section__avatar">NA</div>
          <button className="acc-section__avatar-btn" type="button" title="Đổi ảnh">
            <FaCamera />
          </button>
        </div>
        <div>
          <h2 className="acc-section__name">{form.fullName}</h2>
          <p className="acc-section__meta">{form.email}</p>
          <span className="acc-section__badge">
            <FaShieldAlt /> Tài khoản đã xác thực
          </span>
        </div>
      </div>

      <div className="acc-section__form-title">
        <FaUser /> Thông tin cá nhân
      </div>
      <div className="acc-section__grid">
        <div className="acc-section__field">
          <label>Họ và tên</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nhập họ và tên" />
        </div>
        <div className="acc-section__field">
          <label>Số điện thoại</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" />
        </div>
        <div className="acc-section__field">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
        </div>
        <div className="acc-section__field">
          <label>Ngày sinh</label>
          <input name="dob" type="date" value={form.dob} onChange={handleChange} />
        </div>
        <div className="acc-section__field">
          <label>Giới tính</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      <button className="acc-section__save-btn" type="button" onClick={handleSave}>
        <FaSave /> {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
      </button>

      <div className="acc-section__security">
        <div className="acc-section__form-title">
          <FaKey /> Bảo mật tài khoản
        </div>
        <div className="acc-section__security-row">
          <div>
            <p className="acc-section__sec-label">Mật khẩu</p>
            <p className="acc-section__sec-hint">Lần đổi cuối: 3 tháng trước</p>
          </div>
          <button className="acc-section__sec-btn" type="button">
            Đổi mật khẩu
          </button>
        </div>
        <div className="acc-section__security-row">
          <div>
            <p className="acc-section__sec-label">Xác thực 2 bước</p>
            <p className="acc-section__sec-hint">Bảo vệ tài khoản bằng OTP qua SMS</p>
          </div>
          <label className="acc-section__toggle">
            <input type="checkbox" defaultChecked />
            <span />
          </label>
        </div>
      </div>
    </div>
  )
}

export default AccountSection
