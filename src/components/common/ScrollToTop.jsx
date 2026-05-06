import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // Luôn về đầu trang khi đổi route (tab/trang).
    // Giữ nguyên behavior "auto" để tránh cảm giác giật/scroll ngược khi điều hướng nhanh.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search, hash])

  return null
}

