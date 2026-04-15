// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// ============================================================
// LOCATIONS
// ============================================================

/** Lấy tất cả tỉnh/thành phố (cho dropdown tìm kiếm) */
export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

/** Tìm location theo slug */
export const getLocationBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}


// ============================================================
// POPULAR ROUTES (dùng cho PopularRoutes.jsx)
// ============================================================

/** Lấy danh sách tuyến phổ biến hiển thị trang chủ */
export const getPopularRoutes = async () => {
  const { data, error } = await supabase
    .from('popular_routes_display')
    .select(`
      *,
      origin:origin_id(id, name, slug),
      destination:destination_id(id, name, slug)
    `)
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data
}


// ============================================================
// TRIPS / CHUYẾN XE
// ============================================================

/**
 * Tìm kiếm chuyến xe
 * @param {string} fromSlug - slug điểm đi (vd: "ho-chi-minh")
 * @param {string} toSlug   - slug điểm đến (vd: "da-lat")
 * @param {string} date     - ngày đi (vd: "2025-06-15")
 */
export const searchTrips = async (fromSlug, toSlug, date) => {
  // Lấy location IDs từ slug
  const [origin, destination] = await Promise.all([
    getLocationBySlug(fromSlug),
    getLocationBySlug(toSlug)
  ])

  if (!origin || !destination) return []

  // Tìm route tương ứng
  const { data: routes, error: routeError } = await supabase
    .from('routes')
    .select('id')
    .eq('origin_id', origin.id)
    .eq('destination_id', destination.id)
    .eq('is_active', true)

  if (routeError || !routes.length) return []

  const routeIds = routes.map(r => r.id)

  // Tìm chuyến xe theo route + ngày
  const dateStart = `${date}T00:00:00`
  const dateEnd   = `${date}T23:59:59`

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      route:route_id(
        id, distance_km, duration_minutes,
        origin:origin_id(id, name, slug),
        destination:destination_id(id, name, slug)
      ),
      operator:operator_id(id, name, slug, logo_url, rating, total_reviews),
      bus_type:bus_type_id(id, name, total_seats, amenities)
    `)
    .in('route_id', routeIds)
    .gte('departure_time', dateStart)
    .lte('departure_time', dateEnd)
    .eq('status', 'scheduled')
    .order('departure_time')

  if (error) throw error
  return data
}

/** Lấy chi tiết 1 chuyến xe */
export const getTripById = async (tripId) => {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      route:route_id(
        id, distance_km, duration_minutes,
        origin:origin_id(id, name, slug),
        destination:destination_id(id, name, slug)
      ),
      operator:operator_id(id, name, slug, logo_url, rating, total_reviews, phone),
      bus_type:bus_type_id(id, name, total_seats, amenities, seat_layout)
    `)
    .eq('id', tripId)
    .single()
  if (error) throw error
  return data
}


// ============================================================
// SEATS / GHẾ
// ============================================================

/** Lấy sơ đồ ghế của 1 chuyến xe */
export const getSeatsByTrip = async (tripId) => {
  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .eq('trip_id', tripId)
    .order('seat_number')
  if (error) throw error
  return data
}


// ============================================================
// BOOKINGS / ĐẶT VÉ
// ============================================================

/**
 * Tạo đơn đặt vé mới
 * @param {object} bookingData
 */
export const createBooking = async (bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      ...bookingData,
      status: 'pending',
      payment_status: 'unpaid'
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

/** Lấy lịch sử đặt vé của user hiện tại */
export const getMyBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trip_id(
        departure_time, arrival_time, pickup_address, dropoff_address,
        route:route_id(
          origin:origin_id(name),
          destination:destination_id(name)
        ),
        operator:operator_id(name, logo_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Lấy đơn đặt vé theo booking_code */
export const getBookingByCode = async (bookingCode) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trip_id(
        departure_time, arrival_time, pickup_address, dropoff_address,
        route:route_id(
          origin:origin_id(name),
          destination:destination_id(name)
        ),
        operator:operator_id(name, logo_url, phone)
      )
    `)
    .eq('booking_code', bookingCode)
    .single()
  if (error) throw error
  return data
}

/** Huỷ đặt vé */
export const cancelBooking = async (bookingId) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}


// ============================================================
// AUTH / ĐĂNG NHẬP
// ============================================================

/** Đăng ký tài khoản */
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  if (error) throw error
  return data
}

/** Đăng nhập */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** Đăng xuất */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Lấy user hiện tại */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** Lấy profile user */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}


// ============================================================
// OPERATORS / NHÀ XE
// ============================================================

/** Lấy danh sách nhà xe */
export const getOperators = async () => {
  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
  if (error) throw error
  return data
}

/** Lấy đánh giá của nhà xe */
export const getOperatorReviews = async (operatorId, limit = 10) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_id(full_name, avatar_url)
    `)
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}


// ============================================================
// PROMOTIONS / KHUYẾN MÃI
// ============================================================

/** Kiểm tra mã khuyến mãi */
export const validatePromoCode = async (code, orderValue) => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .single()

  if (error || !data) throw new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn')
  if (data.min_order_value > orderValue) {
    throw new Error(`Đơn hàng tối thiểu ${data.min_order_value.toLocaleString('vi-VN')}đ`)
  }
  if (data.usage_limit && data.used_count >= data.usage_limit) {
    throw new Error('Mã khuyến mãi đã hết lượt sử dụng')
  }
  return data
}
// ============================================================
// THÊM VÀO src/services/supabaseClient.js
// Các hàm xử lý: giá theo ngày lễ + khuyến mãi
// ============================================================


// ============================================================
// GIÁ VÉ THỰC TẾ THEO LOẠI XE (hệ số tham khảo)
// ============================================================
export const BUS_TYPE_MULTIPLIERS = {
  'Ghế ngồi 45 chỗ':      0.70,
  'Ghế ngồi 29 chỗ':      0.80,
  'Giường nằm 40 chỗ':    1.00,   // Chuẩn
  'Giường nằm VIP 34 chỗ':1.40,
  'Limousine 9 chỗ':       1.75,
  'Cabin đôi 22 phòng':    2.20,
}

// Nhãn hiển thị tiện ích
export const AMENITY_LABELS = {
  wifi:      { icon: '📶', label: 'WiFi miễn phí' },
  dieu_hoa:  { icon: '❄️', label: 'Điều hòa' },
  nuoc_uong: { icon: '💧', label: 'Nước uống' },
  khan_lanh: { icon: '🧴', label: 'Khăn lạnh' },
  usb:       { icon: '🔌', label: 'Cổng USB' },
  man_hinh:  { icon: '📺', label: 'Màn hình' },
  tu_lanh:   { icon: '🧊', label: 'Tủ lạnh mini' },
}


// ============================================================
// NGÀY LỄ - Kiểm tra từ Supabase
// ============================================================

/**
 * Lấy thông tin tăng giá ngày lễ cho một ngày cụ thể
 * @param {string} date - Ngày cần kiểm tra (YYYY-MM-DD)
 * @returns {{ name, surcharge_pct } | null}
 */
export const getHolidaySurcharge = async (date) => {
  const { data, error } = await supabase
    .from('holiday_surcharges')
    .select('name, surcharge_pct, note')
    .eq('is_active', true)
    .lte('start_date', date)
    .gte('end_date', date)
    .order('surcharge_pct', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data  // null nếu không có ngày lễ
}

/**
 * Lấy tất cả ngày lễ trong 12 tháng tới (cho calendar hiển thị)
 */
export const getUpcomingHolidays = async () => {
  const today = new Date().toISOString().split('T')[0]
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('holiday_surcharges')
    .select('name, start_date, end_date, surcharge_pct, note')
    .eq('is_active', true)
    .gte('end_date', today)
    .lte('start_date', nextYear)
    .order('start_date')

  if (error) throw error
  return data
}


// ============================================================
// TÌM KIẾM CHUYẾN XE (cập nhật có kèm thông tin ngày lễ)
// ============================================================

/**
 * Tìm kiếm chuyến xe + tính giá + kiểm tra ngày lễ
 * @param {string} fromSlug
 * @param {string} toSlug
 * @param {string} date  - YYYY-MM-DD
 */
export const searchTripsWithPricing = async (fromSlug, toSlug, date) => {
  // 1. Lấy locations
  const [origin, destination] = await Promise.all([
    getLocationBySlug(fromSlug),
    getLocationBySlug(toSlug)
  ])
  if (!origin || !destination) return { trips: [], holiday: null }

  // 2. Lấy thông tin ngày lễ
  const holiday = await getHolidaySurcharge(date)

  // 3. Lấy routes
  const { data: routes, error: routeError } = await supabase
    .from('routes')
    .select('id, base_price_standard')
    .eq('origin_id', origin.id)
    .eq('destination_id', destination.id)
    .eq('is_active', true)

  if (routeError || !routes.length) return { trips: [], holiday }

  const routeIds = routes.map(r => r.id)
  const dateStart = `${date}T00:00:00`
  const dateEnd   = `${date}T23:59:59`

  // 4. Lấy chuyến xe
  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      route:route_id(
        id, distance_km, duration_minutes, base_price_standard,
        origin:origin_id(id, name, slug),
        destination:destination_id(id, name, slug)
      ),
      operator:operator_id(id, name, slug, logo_url, rating, total_reviews),
      bus_type:bus_type_id(id, name, total_seats, amenities, price_multiplier)
    `)
    .in('route_id', routeIds)
    .gte('departure_time', dateStart)
    .lte('departure_time', dateEnd)
    .eq('status', 'scheduled')
    .order('departure_time')

  if (error) throw error

  // 5. Tính giá hiển thị (base_price đã tính sẵn trong DB, kèm thêm thông tin)
  const tripsWithInfo = trips.map(trip => ({
    ...trip,
    // Giá đã lưu trong DB (đã nhân hệ số xe và ngày lễ khi INSERT)
    display_price: trip.base_price,
    // Tính % tiết kiệm so với giá gốc (nếu cần hiển thị)
    original_price: trip.route?.base_price_standard
      ? Math.round(trip.route.base_price_standard * (trip.bus_type?.price_multiplier || 1) / 1000) * 1000
      : null,
    // Thông tin ngày lễ (để hiển thị badge)
    holiday_info: holiday,
    // Duration dạng text
    duration_text: formatDuration(trip.route?.duration_minutes),
    // Danh sách tiện ích dạng object
    amenity_details: (trip.bus_type?.amenities || []).map(key => AMENITY_LABELS[key]).filter(Boolean),
  }))

  return { trips: tripsWithInfo, holiday }
}


// ============================================================
// KHUYẾN MÃI
// ============================================================

/**
 * Kiểm tra và tính toán mã khuyến mãi
 * @param {string} code        - Mã khuyến mãi (vd: "HIUSGO10")
 * @param {number} orderValue  - Giá trị đơn hàng (VND)
 * @returns {{ promo, discount_amount, final_price }}
 */
export const applyPromoCode = async (code, orderValue) => {
  if (!code || !code.trim()) throw new Error('Vui lòng nhập mã khuyến mãi')

  const today = new Date().toISOString().split('T')[0]

  const { data: promo, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .maybeSingle()

  if (error) throw error
  if (!promo) throw new Error('Mã khuyến mãi không tồn tại hoặc đã hết hạn')
  if (promo.min_order_value > orderValue) {
    throw new Error(`Đơn hàng tối thiểu ${formatPrice(promo.min_order_value)} để áp dụng mã này`)
  }
  if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
    throw new Error('Mã khuyến mãi đã hết lượt sử dụng')
  }

  // Tính số tiền giảm
  let discount_amount = 0
  if (promo.discount_type === 'percent') {
    discount_amount = Math.round(orderValue * promo.discount_value / 100)
    if (promo.max_discount && discount_amount > promo.max_discount) {
      discount_amount = promo.max_discount
    }
  } else {
    // fixed
    discount_amount = promo.discount_value
  }

  // Không giảm quá giá trị đơn hàng
  discount_amount = Math.min(discount_amount, orderValue)
  const final_price = orderValue - discount_amount

  return { promo, discount_amount, final_price }
}

/**
 * Đánh dấu mã khuyến mãi đã được sử dụng
 * (Gọi sau khi booking thành công)
 */
export const markPromoUsed = async (code) => {
  const { error } = await supabase.rpc('increment_promo_usage', { promo_code: code })
  if (error) console.error('Không cập nhật được lượt dùng KM:', error)
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Format giá VND: 250000 → "250.000đ" */
export const formatPrice = (price) => {
  if (!price) return '0đ'
  return price.toLocaleString('vi-VN') + 'đ'
}

/** Format thời gian di chuyển: 420 → "7 tiếng" hoặc "7h30p" */
export const formatDuration = (minutes) => {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} tiếng`
  return `${h}h${m}p`
}

/** Format ngày giờ: ISO → "07:00 - Thứ Hai, 15/06/2025" */
export const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  const days = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy']
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const date = d.toLocaleDateString('vi-VN')
  return `${time} - ${days[d.getDay()]}, ${date}`
}

/** Format chỉ giờ: ISO → "07:00" */
export const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/** Tính số sao rating (1-5) */
export const formatRating = (rating) => {
  const full  = Math.floor(rating)
  const half  = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '⭐'.repeat(full) + (half ? '✨' : '') + '☆'.repeat(empty)
}