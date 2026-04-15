-- ================================================================
--  ██╗  ██╗██╗██╗   ██╗███████╗ ██████╗  ██████╗
--  ██║  ██║██║██║   ██║██╔════╝██╔════╝ ██╔═══██╗
--  ███████║██║██║   ██║███████╗██║  ███╗██║   ██║
--  ██╔══██║██║██║   ██║╚════██║██║   ██║██║   ██║
--  ██║  ██║██║╚██████╔╝███████║╚██████╔╝╚██████╔╝
--  ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝
-- ================================================================
-- HIUSGO - COMPLETE DATABASE SCHEMA & SEED DATA
-- Nền tảng: Supabase (PostgreSQL 15+)
-- Phiên bản: 2.0 - Đa phương tiện
-- Cập nhật lần cuối: 2025
-- ================================================================
--
-- MÔ TẢ DỰ ÁN:
--   HiusGo là nền tảng đặt vé & thuê phương tiện di chuyển tại VN.
--   Sản phẩm chính : Vé xe bus / xe khách liên tỉnh
--   Sản phẩm phụ  : Vé tàu hỏa, vé máy bay, thuê xe tự lái/có tài xế
--
-- KIẾN TRÚC DATABASE:
--   Chiến lược "Shared Core + JSONB Extension"
--   • Xe bus   → dùng toàn bộ hệ thống (full-featured)
--   • Tàu/Bay/Thuê xe → dùng chung core + extra_info JSONB linh hoạt
--   • Thêm loại phương tiện mới → chỉ cần thêm data, không cần migration
--
-- THỨ TỰ CHẠY FILE NÀY:
--   File này là ALL-IN-ONE, chạy 1 lần duy nhất trên database trống.
--   Nếu database đã có data cũ → chạy phần RESET ở cuối file trước.
--
-- ================================================================
-- INDEX NỘI DUNG:
--   PHẦN A : EXTENSIONS & SETTINGS
--   PHẦN B : SCHEMA - Tạo bảng
--     B01 - locations           (Tỉnh/Thành phố)
--     B02 - operators           (Nhà vận hành: xe/tàu/bay/thuê xe)
--     B03 - bus_types           (Loại phương tiện/hạng vé)
--     B04 - routes              (Tuyến đường)
--     B05 - trips               (Chuyến đi)
--     B06 - seats               (Ghế - chỉ dùng cho xe bus)
--     B07 - users               (Người dùng - kết nối Supabase Auth)
--     B08 - bookings            (Đặt vé)
--     B09 - reviews             (Đánh giá)
--     B10 - popular_routes_display (Tuyến nổi bật trang chủ)
--     B11 - promotions          (Mã khuyến mãi)
--     B12 - holiday_surcharges  (Phụ thu ngày lễ)
--     B13 - trip_price_history  (Lịch sử thay đổi giá)
--   PHẦN C : FUNCTIONS & TRIGGERS
--     C01 - update_updated_at
--     C02 - generate_booking_code
--     C03 - handle_new_user
--     C04 - update_available_seats
--     C05 - calculate_ticket_price
--     C06 - increment_promo_usage
--     C07 - search_trips
--   PHẦN D : VIEWS
--     D01 - v_trips_full
--     D02 - v_price_matrix
--   PHẦN E : ROW LEVEL SECURITY (RLS)
--   PHẦN F : SEED DATA
--     F01 - locations
--     F02 - operators
--     F03 - bus_types (vehicle types)
--     F04 - routes
--     F05 - popular_routes_display
--     F06 - holiday_surcharges
--     F07 - trips (sample data)
--     F08 - promotions
-- ================================================================


-- ================================================================
-- PHẦN A: EXTENSIONS & SETTINGS
-- ================================================================

-- UUID generation (dùng cho auth integration)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ================================================================
-- PHẦN B: SCHEMA
-- ================================================================


-- ----------------------------------------------------------------
-- B01. LOCATIONS - Tỉnh/Thành phố
-- ----------------------------------------------------------------
CREATE TABLE locations (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL UNIQUE,   -- URL-friendly, vd: "ha-noi"
  region     VARCHAR(20)  DEFAULT 'other'
               CHECK (region IN ('north', 'central', 'south', 'other')),
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON TABLE  locations        IS 'Danh sách tỉnh/thành phố điểm đi và điểm đến';
COMMENT ON COLUMN locations.slug   IS 'Dùng cho URL, vd: /search?from=ha-noi';
COMMENT ON COLUMN locations.region IS 'Vùng miền: north=Bắc, central=Trung, south=Nam';


-- ----------------------------------------------------------------
-- B02. OPERATORS - Nhà vận hành (xe bus / tàu / hãng bay / thuê xe)
-- ----------------------------------------------------------------
CREATE TABLE operators (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  slug           VARCHAR(150) NOT NULL UNIQUE,
  logo_url       TEXT,
  rating         NUMERIC(2,1) DEFAULT 4.0
                   CHECK (rating >= 1 AND rating <= 5),
  total_reviews  INT          DEFAULT 0,
  phone          VARCHAR(20),
  email          VARCHAR(100),
  description    TEXT,

  -- [ĐA PHƯƠNG TIỆN] Loại nhà vận hành
  operator_type  VARCHAR(20)  DEFAULT 'bus'
                   CHECK (operator_type IN ('bus', 'train', 'airline', 'car_rental', 'other')),

  -- [ĐA PHƯƠNG TIỆN] Mã IATA cho hãng bay (VN, VJ, QH...)
  iata_code      VARCHAR(10),

  is_active      BOOLEAN      DEFAULT true,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON TABLE  operators               IS 'Nhà vận hành: nhà xe, đường sắt, hãng bay, công ty thuê xe';
COMMENT ON COLUMN operators.operator_type IS 'bus=nhà xe, train=đường sắt, airline=hãng bay, car_rental=thuê xe';
COMMENT ON COLUMN operators.iata_code     IS 'Mã IATA 2 ký tự cho hãng bay. NULL với các loại khác';
COMMENT ON COLUMN operators.rating        IS 'Đánh giá trung bình 1.0-5.0, tự động cập nhật từ reviews';


-- ----------------------------------------------------------------
-- B03. BUS_TYPES - Loại phương tiện / Hạng vé
-- Tên giữ nguyên "bus_types" để không phá code frontend cũ.
-- Thực tế dùng cho tất cả phương tiện qua cột transport_type.
-- ----------------------------------------------------------------
CREATE TABLE bus_types (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,   -- vd: "Giường nằm 40 chỗ", "Economy", "Tàu - Nằm mềm"
  description      TEXT,
  total_seats      INT          NOT NULL,   -- Tổng ghế/giường/chỗ của loại này
  seat_layout      JSONB,                   -- Sơ đồ ghế JSON (tùy chọn, chủ yếu dùng cho xe bus)
  amenities        TEXT[],                  -- ['wifi','dieu_hoa','nuoc_uong','usb','man_hinh',...]
  price_multiplier NUMERIC(3,2) DEFAULT 1.00, -- Hệ số giá so với base_price_standard của tuyến

  -- [ĐA PHƯƠNG TIỆN] Phân loại phương tiện
  transport_type   VARCHAR(20)  DEFAULT 'bus'
                     CHECK (transport_type IN ('bus', 'train', 'plane', 'car_rental')),

  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON TABLE  bus_types                  IS 'Loại phương tiện/hạng vé. Tên "bus_types" giữ nguyên để tương thích, dùng transport_type để phân biệt';
COMMENT ON COLUMN bus_types.price_multiplier IS 'Hệ số nhân giá: 0.6=ghế cứng, 1.0=chuẩn, 1.75=limousine, 3.5=business';
COMMENT ON COLUMN bus_types.transport_type   IS 'bus=xe khách, train=tàu hỏa, plane=máy bay, car_rental=thuê xe';
COMMENT ON COLUMN bus_types.amenities        IS 'Tiện ích: wifi, dieu_hoa, nuoc_uong, khan_lanh, usb, man_hinh, tu_lanh, bluetooth, camera_lui, hanh_ly_xach_tay, an_uong, phong_cho_vip, micro';


-- ----------------------------------------------------------------
-- B04. ROUTES - Tuyến đường
-- Dùng chung cho tất cả phương tiện. Cùng 1 hành trình HN→SG
-- có thể có nhiều route với transport_type khác nhau.
-- ----------------------------------------------------------------
CREATE TABLE routes (
  id                   SERIAL PRIMARY KEY,
  origin_id            INT     NOT NULL REFERENCES locations(id),
  destination_id       INT     NOT NULL REFERENCES locations(id),
  distance_km          INT,
  duration_minutes     INT,                -- Thời gian dự kiến (phút)
  is_popular           BOOLEAN DEFAULT false,  -- Hiển thị ở PopularRoutes
  is_active            BOOLEAN DEFAULT true,

  -- Giá nền theo tuyến (giá thấp nhất / loại cơ bản nhất)
  -- Giá thực = base_price_standard × bus_types.price_multiplier × (1 + holiday_surcharge%)
  base_price_standard  INT     DEFAULT 0,

  -- [ĐA PHƯƠNG TIỆN] Phân loại tuyến theo phương tiện
  -- 'all' = tuyến dùng chung cho nhiều phương tiện (vd: HN-SG có bus/tàu/bay)
  transport_type       VARCHAR(20) DEFAULT 'bus'
                         CHECK (transport_type IN ('bus', 'train', 'plane', 'car_rental', 'all')),

  created_at           TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT no_same_location CHECK (origin_id != destination_id)
);

CREATE INDEX idx_routes_origin          ON routes(origin_id);
CREATE INDEX idx_routes_destination     ON routes(destination_id);
CREATE INDEX idx_routes_popular         ON routes(is_popular) WHERE is_popular = true;
CREATE INDEX idx_routes_transport_type  ON routes(transport_type);

COMMENT ON TABLE  routes                      IS 'Tuyến đường. Một hành trình có thể có nhiều routes với transport_type khác nhau';
COMMENT ON COLUMN routes.base_price_standard  IS 'Giá cơ bản (VND). Giá thực = base × price_multiplier × holiday_factor';
COMMENT ON COLUMN routes.transport_type       IS 'bus/train/plane/car_rental/all. all=tuyến dùng chung nhiều phương tiện';


-- ----------------------------------------------------------------
-- B05. TRIPS - Chuyến đi (core table, dùng cho tất cả phương tiện)
-- ----------------------------------------------------------------
CREATE TABLE trips (
  id              SERIAL PRIMARY KEY,
  route_id        INT     NOT NULL REFERENCES routes(id),
  operator_id     INT     NOT NULL REFERENCES operators(id),
  bus_type_id     INT     NOT NULL REFERENCES bus_types(id),

  departure_time  TIMESTAMPTZ NOT NULL,
  arrival_time    TIMESTAMPTZ NOT NULL,

  pickup_address  TEXT,   -- Điểm đón (bến xe / ga / sân bay / địa chỉ)
  dropoff_address TEXT,   -- Điểm trả (bến xe / ga / sân bay / địa chỉ)

  base_price      NUMERIC(12,0) NOT NULL,  -- Giá vé (VND), đã tính theo mùa/lễ
  available_seats INT           NOT NULL,  -- Số chỗ còn trống (realtime)

  status          VARCHAR(20)   DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','boarding','departed','arrived','cancelled')),

  -- [ĐA PHƯƠNG TIỆN] Loại phương tiện (denormalize từ bus_types để query nhanh)
  transport_type  VARCHAR(20)   DEFAULT 'bus'
                    CHECK (transport_type IN ('bus', 'train', 'plane', 'car_rental')),

  -- [ĐA PHƯƠNG TIỆN] Thông tin mở rộng theo từng loại phương tiện
  -- Bus:        {} hoặc NULL (dùng các cột có sẵn là đủ)
  -- Train:      {"train_code":"SE1","carriage_number":"7","seat_class":"giu_nam_mem",
  --              "departure_station":"Ga Sài Gòn","arrival_station":"Ga Đà Nẵng"}
  -- Plane:      {"flight_code":"VN123","terminal":"T1","gate":"G12",
  --              "cabin_class":"economy","baggage_allowance_kg":23}
  -- Car rental: {"has_driver":false,"price_per_day":650000,"min_rental_days":1,
  --              "car_model":"Toyota Vios 2023","fuel_policy":"full_to_full",
  --              "pickup_location":"Văn phòng hoặc giao tận nơi"}
  extra_info      JSONB         DEFAULT '{}',

  -- [CHỈ DÙNG CHO CAR RENTAL] Giá theo ngày
  price_per_day   NUMERIC(12,0),

  note            TEXT,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX idx_trips_route          ON trips(route_id);
CREATE INDEX idx_trips_departure      ON trips(departure_time);
CREATE INDEX idx_trips_status         ON trips(status);
CREATE INDEX idx_trips_transport_type ON trips(transport_type);
CREATE INDEX idx_trips_extra_info     ON trips USING GIN(extra_info);  -- Tìm nhanh theo JSONB

COMMENT ON TABLE  trips                IS 'Chuyến đi - bảng trung tâm của hệ thống, dùng chung cho mọi phương tiện';
COMMENT ON COLUMN trips.transport_type IS 'Denormalize từ bus_types để tránh JOIN khi filter theo phương tiện';
COMMENT ON COLUMN trips.extra_info     IS 'JSONB mở rộng: train={train_code,carriage,seat_class}, plane={flight_code,terminal,gate,cabin}, car={has_driver,price_per_day,car_model,fuel_policy}';
COMMENT ON COLUMN trips.price_per_day  IS 'Chỉ dùng cho car_rental. NULL với bus/train/plane';
COMMENT ON COLUMN trips.base_price     IS 'Giá đã tính sẵn (dùng calculate_ticket_price() lúc INSERT)';


-- ----------------------------------------------------------------
-- B06. SEATS - Ghế/Giường (chủ yếu dùng cho xe bus)
-- Tàu/máy bay quản lý ghế theo carriage/cabin trong extra_info.
-- ----------------------------------------------------------------
CREATE TABLE seats (
  id          SERIAL PRIMARY KEY,
  trip_id     INT     NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,   -- vd: "A1", "B2", "T01"
  deck        VARCHAR(10) DEFAULT 'lower'
                CHECK (deck IN ('lower', 'upper', 'single')),
  status      VARCHAR(20) DEFAULT 'available'
                CHECK (status IN ('available', 'booked', 'locked', 'unavailable')),
  price       NUMERIC(12,0),          -- Giá ghế riêng (nếu khác base_price, vd: ghế đầu đắt hơn)

  UNIQUE (trip_id, seat_number)
);

CREATE INDEX idx_seats_trip   ON seats(trip_id);
CREATE INDEX idx_seats_status ON seats(status);

COMMENT ON TABLE  seats       IS 'Ghế/giường xe bus. Tàu hỏa và máy bay quản lý chỗ ngồi qua extra_info trong trips';
COMMENT ON COLUMN seats.deck  IS 'Tầng xe: lower=tầng dưới, upper=tầng trên, single=xe 1 tầng';
COMMENT ON COLUMN seats.price IS 'Giá riêng của ghế nếu khác base_price (vd: ghế đầu, ghế đôi). NULL=dùng base_price';


-- ----------------------------------------------------------------
-- B07. USERS - Người dùng
-- Kết hợp với Supabase Auth (auth.users)
-- ----------------------------------------------------------------
CREATE TABLE users (
  id            UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     VARCHAR(100),
  phone         VARCHAR(20),
  avatar_url    TEXT,
  date_of_birth DATE,
  gender        VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  role          VARCHAR(20) DEFAULT 'customer'
                  CHECK (role IN ('customer', 'admin', 'operator')),
  is_active     BOOLEAN     DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE  users      IS 'Profile người dùng, link 1-1 với auth.users của Supabase';
COMMENT ON COLUMN users.role IS 'customer=khách hàng, admin=quản trị, operator=nhà vận hành';


-- ----------------------------------------------------------------
-- B08. BOOKINGS - Đặt vé
-- ----------------------------------------------------------------
CREATE TABLE bookings (
  id              SERIAL PRIMARY KEY,
  booking_code    VARCHAR(20) NOT NULL UNIQUE,  -- Auto-gen: "HG20250101001"
  user_id         UUID        REFERENCES users(id),  -- NULL nếu đặt không cần login

  trip_id         INT         NOT NULL REFERENCES trips(id),

  -- Thông tin hành khách (luôn lưu lại dù có/không có tài khoản)
  passenger_name  VARCHAR(100) NOT NULL,
  passenger_phone VARCHAR(20)  NOT NULL,
  passenger_email VARCHAR(100),

  -- Ghế đã chọn (chủ yếu cho xe bus)
  seat_ids        INT[],       -- Array seat.id
  seat_numbers    TEXT[],      -- vd: ["A1","A2"] - lưu để hiển thị nhanh
  num_seats       INT          NOT NULL DEFAULT 1,

  -- Giá tiền
  total_price     NUMERIC(12,0) NOT NULL,
  promo_code      VARCHAR(50),             -- Mã giảm giá đã dùng
  discount_amount NUMERIC(12,0) DEFAULT 0, -- Số tiền được giảm

  -- Trạng thái đặt vé
  status          VARCHAR(20)   DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','paid','cancelled','refunded')),

  -- Thanh toán
  payment_method  VARCHAR(30)
                    CHECK (payment_method IN ('momo','zalopay','vnpay','visa','mastercard','cash','other')),
  payment_status  VARCHAR(20)   DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
  payment_at      TIMESTAMPTZ,

  -- [ĐA PHƯƠNG TIỆN] Loại phương tiện (denormalize để filter nhanh)
  transport_type  VARCHAR(20)   DEFAULT 'bus'
                    CHECK (transport_type IN ('bus', 'train', 'plane', 'car_rental')),

  -- [CHỈ DÙNG CHO CAR RENTAL]
  rental_start_date DATE,   -- Ngày bắt đầu thuê xe
  rental_end_date   DATE,   -- Ngày kết thúc thuê xe
  rental_days       INT,    -- Số ngày thuê (rental_end - rental_start)

  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user          ON bookings(user_id);
CREATE INDEX idx_bookings_trip          ON bookings(trip_id);
CREATE INDEX idx_bookings_code          ON bookings(booking_code);
CREATE INDEX idx_bookings_status        ON bookings(status);
CREATE INDEX idx_bookings_transport_type ON bookings(transport_type);

COMMENT ON TABLE  bookings                 IS 'Đơn đặt vé. Dùng chung cho bus/train/plane/car_rental';
COMMENT ON COLUMN bookings.booking_code    IS 'Mã đặt vé tự sinh: HG + YYYYMMDD + 4 số. vd: HG202501010001';
COMMENT ON COLUMN bookings.seat_ids        IS 'Array ID ghế từ bảng seats. Chủ yếu dùng cho xe bus';
COMMENT ON COLUMN bookings.promo_code      IS 'Mã khuyến mãi đã áp dụng, ref đến promotions.code';
COMMENT ON COLUMN bookings.transport_type  IS 'Denormalize từ trips để query nhanh, không cần JOIN';
COMMENT ON COLUMN bookings.rental_days     IS 'Chỉ dùng cho car_rental: số ngày = rental_end - rental_start';


-- ----------------------------------------------------------------
-- B09. REVIEWS - Đánh giá
-- ----------------------------------------------------------------
CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  booking_id  INT  NOT NULL REFERENCES bookings(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  operator_id INT  NOT NULL REFERENCES operators(id),
  trip_id     INT  NOT NULL REFERENCES trips(id),
  rating      INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE reviews IS 'Đánh giá sau chuyến đi. 1 booking = tối đa 1 review';


-- ----------------------------------------------------------------
-- B10. POPULAR_ROUTES_DISPLAY - Tuyến nổi bật (trang chủ)
-- Dùng cho component PopularRoutes.jsx
-- ----------------------------------------------------------------
CREATE TABLE popular_routes_display (
  id              SERIAL PRIMARY KEY,
  label           VARCHAR(200) NOT NULL,       -- vd: "Xe đi Sapa từ Hà Nội"
  origin_id       INT REFERENCES locations(id),
  destination_id  INT REFERENCES locations(id),
  display_order   INT     DEFAULT 0,
  category        VARCHAR(20) DEFAULT 'bus'
                    CHECK (category IN ('bus', 'train', 'plane', 'shuttle', 'car_rental')),
  is_active       BOOLEAN DEFAULT true
);

COMMENT ON TABLE  popular_routes_display          IS 'Cấu hình tuyến nổi bật hiển thị trang chủ, quản lý thủ công';
COMMENT ON COLUMN popular_routes_display.category IS 'Loại phương tiện để filter tab trên UI';


-- ----------------------------------------------------------------
-- B11. PROMOTIONS - Mã khuyến mãi
-- ----------------------------------------------------------------
CREATE TABLE promotions (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(50) UNIQUE,
  title          VARCHAR(200) NOT NULL,
  description    TEXT,
  discount_type  VARCHAR(20)
                   CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,0),          -- % hoặc VND tùy discount_type
  min_order_value NUMERIC(12,0) DEFAULT 0,
  max_discount   NUMERIC(12,0),          -- Giảm tối đa (dùng khi discount_type='percent')
  start_date     DATE,
  end_date       DATE,
  usage_limit    INT,                    -- NULL = không giới hạn lượt dùng
  used_count     INT  DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE  promotions               IS 'Mã khuyến mãi. Áp dụng khi đặt vé, mọi loại phương tiện';
COMMENT ON COLUMN promotions.usage_limit   IS 'NULL = không giới hạn';
COMMENT ON COLUMN promotions.max_discount  IS 'Giảm tối đa khi dùng percent. vd: 20% nhưng tối đa 200k';


-- ----------------------------------------------------------------
-- B12. HOLIDAY_SURCHARGES - Phụ thu ngày lễ
-- ----------------------------------------------------------------
CREATE TABLE holiday_surcharges (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  start_date    DATE         NOT NULL,
  end_date      DATE         NOT NULL,
  surcharge_pct INT          NOT NULL,   -- % tăng thêm (vd: 35 = +35%)
  note          TEXT,
  is_active     BOOLEAN      DEFAULT true
);

COMMENT ON TABLE  holiday_surcharges              IS 'Phụ thu ngày lễ/Tết. Dùng trong calculate_ticket_price()';
COMMENT ON COLUMN holiday_surcharges.surcharge_pct IS 'Phần trăm tăng thêm: 20=+20%, 40=Tết +40%';


-- ----------------------------------------------------------------
-- B13. TRIP_PRICE_HISTORY - Lịch sử thay đổi giá
-- ----------------------------------------------------------------
CREATE TABLE trip_price_history (
  id         SERIAL PRIMARY KEY,
  trip_id    INT  NOT NULL REFERENCES trips(id),
  old_price  NUMERIC(12,0),
  new_price  NUMERIC(12,0),
  reason     TEXT,   -- 'holiday_surcharge' | 'demand' | 'manual' | 'promo'
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE trip_price_history IS 'Audit log thay đổi giá vé theo thời gian';


-- ================================================================
-- PHẦN C: FUNCTIONS & TRIGGERS
-- ================================================================


-- ----------------------------------------------------------------
-- C01. Auto-update updated_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------
-- C02. Auto-generate booking_code
-- Format: HG + YYYYMMDD + 4 chữ số ID
-- vd: HG202501010001
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_code = 'HG' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEW.id::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL OR NEW.booking_code = '')
  EXECUTE FUNCTION generate_booking_code();


-- ----------------------------------------------------------------
-- C03. Auto-create user profile khi đăng ký qua Supabase Auth
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ----------------------------------------------------------------
-- C04. Auto-update available_seats khi booking thay đổi
-- INSERT booking → trừ ghế
-- Hủy booking → cộng ghế lại
-- Khôi phục booking → trừ ghế lại
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- Booking mới (không phải cancelled ngay)
  IF TG_OP = 'INSERT' AND NEW.status NOT IN ('cancelled') THEN
    UPDATE trips
    SET available_seats = available_seats - NEW.num_seats
    WHERE id = NEW.trip_id;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Vừa bị hủy → cộng lại ghế
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      UPDATE trips
      SET available_seats = available_seats + OLD.num_seats
      WHERE id = OLD.trip_id;
    END IF;
    -- Được khôi phục từ cancelled → trừ ghế lại
    IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      UPDATE trips
      SET available_seats = available_seats - NEW.num_seats
      WHERE id = NEW.trip_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seats
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_available_seats();


-- ----------------------------------------------------------------
-- C05. calculate_ticket_price() - Tính giá vé cuối cùng
--
-- Công thức:
--   Giá = ROUND(base_price_standard × price_multiplier × (1 + holiday_pct/100) / 1000) × 1000
--
-- Ví dụ: Tuyến HN→SG (base=400k), Limousine (×1.75), Tết (+40%)
--   = ROUND(400000 × 1.75 × 1.40 / 1000) × 1000 = 980.000đ
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_ticket_price(
  p_route_id    INT,          -- ID tuyến đường
  p_bus_type_id INT,          -- ID loại phương tiện/hạng vé
  p_departure   TIMESTAMPTZ   -- Ngày giờ khởi hành (để check ngày lễ)
)
RETURNS NUMERIC AS $$
DECLARE
  v_base_price   INT;
  v_multiplier   NUMERIC(3,2);
  v_holiday_pct  INT := 0;
  v_final_price  NUMERIC;
BEGIN
  SELECT base_price_standard INTO v_base_price
  FROM routes WHERE id = p_route_id;

  SELECT price_multiplier INTO v_multiplier
  FROM bus_types WHERE id = p_bus_type_id;

  -- Lấy mức phụ thu cao nhất nếu trùng nhiều ngày lễ
  SELECT COALESCE(MAX(surcharge_pct), 0) INTO v_holiday_pct
  FROM holiday_surcharges
  WHERE is_active = true
    AND p_departure::DATE BETWEEN start_date AND end_date;

  -- Làm tròn đến nghìn đồng
  v_final_price := ROUND(
    (v_base_price * v_multiplier * (1 + v_holiday_pct::NUMERIC / 100)) / 1000
  ) * 1000;

  RETURN v_final_price;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_ticket_price IS
  'Tính giá vé = base_price_standard × price_multiplier × (1 + holiday_surcharge%). Làm tròn đến 1.000đ';


-- ----------------------------------------------------------------
-- C06. increment_promo_usage() - Tăng used_count an toàn (race-condition safe)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE promotions
  SET used_count = used_count + 1
  WHERE code = promo_code AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_promo_usage IS 'Tăng used_count của mã giảm giá. Gọi sau khi booking thành công';


-- ----------------------------------------------------------------
-- C07. search_trips() - Tìm kiếm chuyến theo phương tiện + tuyến + ngày
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_trips(
  p_origin_id      INT,
  p_destination_id INT,
  p_date           DATE,
  p_transport_type VARCHAR DEFAULT 'bus'  -- 'bus'|'train'|'plane'|'car_rental'
)
RETURNS TABLE (
  trip_id         INT,
  transport_type  VARCHAR,
  operator_name   VARCHAR,
  vehicle_name    VARCHAR,
  departure_time  TIMESTAMPTZ,
  arrival_time    TIMESTAMPTZ,
  base_price      NUMERIC,
  available_seats INT,
  amenities       TEXT[],
  extra_info      JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.transport_type,
    o.name,
    bt.name,
    t.departure_time,
    t.arrival_time,
    t.base_price,
    t.available_seats,
    bt.amenities,
    t.extra_info
  FROM trips t
  JOIN routes    r  ON t.route_id    = r.id
  JOIN operators o  ON t.operator_id = o.id
  JOIN bus_types bt ON t.bus_type_id = bt.id
  WHERE r.origin_id      = p_origin_id
    AND r.destination_id = p_destination_id
    AND t.transport_type = p_transport_type
    AND t.departure_time::DATE = p_date
    AND t.status NOT IN ('cancelled', 'arrived')
    AND t.available_seats > 0
  ORDER BY t.base_price ASC, t.departure_time ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_trips IS
  'Tìm chuyến đi theo: origin, destination, ngày, loại phương tiện. Kết quả sort theo giá tăng dần';


-- ================================================================
-- PHẦN D: VIEWS
-- ================================================================


-- ----------------------------------------------------------------
-- D01. v_trips_full - Chuyến đi đầy đủ thông tin (dùng cho frontend)
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_trips_full AS
SELECT
  -- Thông tin chuyến
  t.id,
  t.departure_time,
  t.arrival_time,
  t.pickup_address,
  t.dropoff_address,
  t.base_price,
  t.price_per_day,           -- Giá thuê/ngày (chỉ car_rental)
  t.available_seats,
  t.status,
  t.transport_type,          -- 'bus'|'train'|'plane'|'car_rental'
  t.extra_info,              -- JSONB mở rộng theo loại phương tiện

  -- Tuyến đường
  r.distance_km,
  r.duration_minutes,
  r.base_price_standard,
  l1.name  AS origin_name,
  l1.slug  AS origin_slug,
  l2.name  AS destination_name,
  l2.slug  AS destination_slug,

  -- Nhà vận hành
  o.name          AS operator_name,
  o.slug          AS operator_slug,
  o.rating        AS operator_rating,
  o.logo_url,
  o.operator_type,           -- 'bus'|'train'|'airline'|'car_rental'
  o.iata_code,               -- Mã IATA hãng bay (VN, VJ, QH...)

  -- Loại phương tiện / hạng vé
  bt.name             AS vehicle_type_name,
  bt.total_seats,
  bt.amenities,
  bt.price_multiplier,
  bt.transport_type   AS vehicle_transport_type

FROM trips t
JOIN routes    r  ON t.route_id       = r.id
JOIN locations l1 ON r.origin_id      = l1.id
JOIN locations l2 ON r.destination_id = l2.id
JOIN operators  o  ON t.operator_id   = o.id
JOIN bus_types bt  ON t.bus_type_id   = bt.id;

COMMENT ON VIEW v_trips_full IS 'View tổng hợp đầy đủ thông tin chuyến đi. Dùng cho listing page và search results';


-- ----------------------------------------------------------------
-- D02. v_price_matrix - Bảng giá theo tuyến × loại xe
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_price_matrix AS
SELECT
  l1.name                           AS diem_di,
  l2.name                           AS diem_den,
  r.distance_km                     AS km,
  bt.name                           AS loai_xe,
  bt.transport_type                 AS phuong_tien,
  r.base_price_standard             AS gia_nen,
  ROUND(r.base_price_standard * bt.price_multiplier / 1000) * 1000
                                    AS gia_thuong,
  ROUND(r.base_price_standard * bt.price_multiplier * 1.20 / 1000) * 1000
                                    AS gia_le_20pct,
  ROUND(r.base_price_standard * bt.price_multiplier * 1.35 / 1000) * 1000
                                    AS gia_le_30_4,
  ROUND(r.base_price_standard * bt.price_multiplier * 1.40 / 1000) * 1000
                                    AS gia_tet
FROM routes r
JOIN locations l1 ON r.origin_id      = l1.id
JOIN locations l2 ON r.destination_id = l2.id
JOIN bus_types bt ON bt.transport_type = r.transport_type OR r.transport_type = 'all'
WHERE r.is_active = true
ORDER BY r.base_price_standard DESC, bt.price_multiplier;

COMMENT ON VIEW v_price_matrix IS 'Bảng giá tham khảo theo tuyến × loại xe × kịch bản ngày lễ. Chỉ dùng để xem, không dùng trong booking';


-- ================================================================
-- PHẦN E: ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Bật RLS cho tất cả bảng
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators               ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_types               ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_routes_display  ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_surcharges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_price_history      ENABLE ROW LEVEL SECURITY;

-- ── PUBLIC READ (không cần đăng nhập) ───────────────────────────
CREATE POLICY "Public read locations"         ON locations            FOR SELECT USING (true);
CREATE POLICY "Public read operators"         ON operators            FOR SELECT USING (true);
CREATE POLICY "Public read routes"            ON routes               FOR SELECT USING (true);
CREATE POLICY "Public read trips"             ON trips                FOR SELECT USING (true);
CREATE POLICY "Public read seats"             ON seats                FOR SELECT USING (true);
CREATE POLICY "Public read bus_types"         ON bus_types            FOR SELECT USING (true);
CREATE POLICY "Public read popular_routes"    ON popular_routes_display FOR SELECT USING (true);
CREATE POLICY "Public read promotions"        ON promotions           FOR SELECT USING (is_active = true);
CREATE POLICY "Public read holiday_surcharges" ON holiday_surcharges  FOR SELECT USING (true);
CREATE POLICY "Public read price_history"     ON trip_price_history   FOR SELECT USING (true);

-- ── USERS: chỉ thao tác profile của chính mình ──────────────────
CREATE POLICY "Users can view own profile"    ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"  ON users FOR UPDATE USING (auth.uid() = id);

-- ── BOOKINGS: chỉ xem/tạo đơn của chính mình ───────────────────
CREATE POLICY "Users can view own bookings"   ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings"     ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ── REVIEWS ─────────────────────────────────────────────────────
CREATE POLICY "Anyone can view reviews"       ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews"  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ================================================================
-- PHẦN F: SEED DATA
-- ================================================================


-- ----------------------------------------------------------------
-- F01. LOCATIONS - 18 tỉnh/thành phố
-- ----------------------------------------------------------------
INSERT INTO locations (name, slug, region) VALUES
('Hà Nội',             'ha-noi',        'north'),
('Hải Phòng',          'hai-phong',     'north'),
('Quảng Ninh',         'quang-ninh',    'north'),
('Nghệ An (Vinh)',     'vinh',          'north'),
('Thanh Hóa',          'thanh-hoa',     'north'),
('Lào Cai (Sapa)',     'sapa',          'north'),
('Đà Nẵng',            'da-nang',       'central'),
('Huế',                'hue',           'central'),
('Quảng Nam (Hội An)', 'hoi-an',        'central'),
('Nha Trang',          'nha-trang',     'central'),
('Đà Lạt',             'da-lat',        'central'),
('TP. Hồ Chí Minh',   'ho-chi-minh',   'south'),
('Cần Thơ',            'can-tho',       'south'),
('Vũng Tàu',           'vung-tau',      'south'),
('Bình Dương',         'binh-duong',    'south'),
('Đồng Nai',           'dong-nai',      'south'),
('Buôn Ma Thuột',      'buon-ma-thuot', 'central'),
('Pleiku',             'pleiku',        'central');

-- ID mapping (để tham khảo khi viết query):
-- 1=HN, 2=HP, 3=QN, 4=Vinh, 5=TH, 6=Sapa
-- 7=ĐN, 8=Huế, 9=HộiAn, 10=NT, 11=ĐL
-- 12=SG, 13=CT, 14=VT, 15=BD, 16=ĐNai, 17=BMT, 18=PK


-- ----------------------------------------------------------------
-- F02. OPERATORS - 14 nhà vận hành (8 xe bus + 1 tàu + 3 bay + 2 thuê xe)
-- ----------------------------------------------------------------
INSERT INTO operators (name, slug, rating, total_reviews, phone, description, operator_type, iata_code) VALUES
-- Xe bus
('Phương Trang (FUTA)', 'phuong-trang',  4.5, 12500, '1900 6067',    'Nhà xe lớn nhất VN, hơn 200 chuyến/ngày',          'bus',        NULL),
('Thành Bưởi',          'thanh-buoi',    4.3,  8200, '028 3838 1515','Chuyên tuyến SG-Đà Lạt, SG-Nha Trang',             'bus',        NULL),
('Hoàng Long',          'hoang-long',    4.2,  6800, '024 3974 4455','Nhà xe Bắc-Nam uy tín',                             'bus',        NULL),
('Kumho Samco',         'kumho-samco',   4.4,  5300, '028 3821 1111','Xe khách cao cấp Hàn Quốc tuyến Bắc-Nam',          'bus',        NULL),
('Sao Việt Express',    'sao-viet',      4.3,  3600, '024 3971 1234','Chuyên tuyến HN-Sapa, cabin VIP & giường nằm',      'bus',        NULL),
('Queen Cafe Bus',      'queen-cafe',    4.4,  4200, '0906 413 468', 'Nổi tiếng tuyến HN-Sapa, xe cabin 22 phòng VIP',    'bus',        NULL),
('Hùng Cường',          'hung-cuong',    4.0,  2900, '0236 3827 555','Tuyến Đà Nẵng - Huế - Hội An và miền Trung',       'bus',        NULL),
('The Sinh Tourist',    'the-sinh',      4.2,  4700, '028 3838 9593','Xe du lịch tuyến miền Nam, Đà Lạt, Vũng Tàu',      'bus',        NULL),
-- Tàu hỏa
('Đường Sắt Việt Nam (VNR)', 'vnr',      4.0,  5000, '1800 599 936','Vận tải đường sắt quốc gia',                        'train',      NULL),
-- Hãng bay
('Vietnam Airlines',    'vietnam-airlines', 4.3, 25000,'1900 1100',  'Hãng hàng không quốc gia, nội địa & quốc tế',      'airline',    'VN'),
('Vietjet Air',         'vietjet',       4.0, 18000, '1900 1886',   'Hãng bay giá rẻ phổ biến nhất VN',                 'airline',    'VJ'),
('Bamboo Airways',      'bamboo',        4.2,  9000, '1900 1166',   'Hãng bay của tập đoàn FLC',                         'airline',    'QH'),
-- Thuê xe
('Mioto Thuê Xe Tự Lái',  'mioto',       4.4,  6000, '028 7779 9979','Nền tảng thuê xe tự lái lớn nhất VN',             'car_rental', NULL),
('Vinasun Thuê Xe',     'vinasun-rental', 4.1,  3000, '028 3827 2727','Dịch vụ thuê xe có tài xế uy tín',               'car_rental', NULL);


-- ----------------------------------------------------------------
-- F03. BUS_TYPES - 19 loại phương tiện / hạng vé
-- ----------------------------------------------------------------
INSERT INTO bus_types (name, description, total_seats, amenities, price_multiplier, transport_type) VALUES

-- ── XE BUS (6 loại) ─────────────────────────────────────────────
('Ghế ngồi 45 chỗ',      'Xe khách ghế ngồi phổ thông 45 chỗ, giá rẻ nhất',       45,
  ARRAY['dieu_hoa'],                                                                  0.70, 'bus'),
('Ghế ngồi 29 chỗ',      'Xe 29 chỗ ghế ngồi có wifi',                             29,
  ARRAY['dieu_hoa','wifi'],                                                           0.80, 'bus'),
('Giường nằm 40 chỗ',    'Xe giường nằm 2 tầng tiêu chuẩn, phổ biến nhất',         40,
  ARRAY['wifi','dieu_hoa','man_hinh','usb'],                                          1.00, 'bus'),
('Giường nằm VIP 34 chỗ','Xe giường nằm cabin riêng có rèm che',                   34,
  ARRAY['wifi','dieu_hoa','nuoc_uong','khan_lanh','usb','man_hinh'],                  1.40, 'bus'),
('Limousine 9 chỗ',      'Xe VIP Limousine ghế recliner 9 chỗ cao cấp',             9,
  ARRAY['wifi','dieu_hoa','nuoc_uong','khan_lanh','usb','man_hinh'],                  1.75, 'bus'),
('Cabin đôi 22 phòng',   'Xe phòng đôi, 2 người/phòng, rèm riêng tư, cao cấp nhất',22,
  ARRAY['wifi','dieu_hoa','nuoc_uong','khan_lanh','usb','man_hinh','tu_lanh'],        2.20, 'bus'),

-- ── TÀU HỎA (5 loại) ────────────────────────────────────────────
('Tàu - Ghế ngồi cứng',  'Tàu hỏa ghế ngồi cứng, rẻ nhất',                       200,
  ARRAY['dieu_hoa'],                                                                  0.60, 'train'),
('Tàu - Ghế ngồi mềm',   'Tàu hỏa ghế ngồi mềm có đệm',                           150,
  ARRAY['dieu_hoa'],                                                                  0.80, 'train'),
('Tàu - Giường nằm cứng','Tàu hỏa khoang 6 giường nằm cứng',                        60,
  ARRAY['dieu_hoa'],                                                                  1.00, 'train'),
('Tàu - Giường nằm mềm', 'Tàu hỏa khoang 4 giường nằm mềm, điều hòa riêng',        40,
  ARRAY['dieu_hoa','usb'],                                                            1.40, 'train'),
('Tàu - VIP 2 giường',   'Tàu hỏa khoang 2 giường, cao cấp nhất',                   20,
  ARRAY['dieu_hoa','usb','man_hinh'],                                                 2.00, 'train'),

-- ── MÁY BAY (3 hạng) ────────────────────────────────────────────
('Máy bay - Phổ thông',         'Economy class',                                    150,
  ARRAY['hanh_ly_xach_tay'],                                                          1.00, 'plane'),
('Máy bay - Phổ thông đặc biệt','Premium Economy',                                   30,
  ARRAY['hanh_ly_xach_tay','an_uong'],                                                1.80, 'plane'),
('Máy bay - Thương gia',        'Business class',                                    16,
  ARRAY['hanh_ly_xach_tay','an_uong','phong_cho_vip'],                               3.50, 'plane'),

-- ── THUÊ XE (5 loại) ────────────────────────────────────────────
('Thuê xe - 4 chỗ tự lái',    'Sedan/Hatchback 4 chỗ, không tài xế',                4,
  ARRAY['dieu_hoa','bluetooth'],                                                       1.00, 'car_rental'),
('Thuê xe - 7 chỗ tự lái',    'MPV/SUV 7 chỗ tự lái',                               7,
  ARRAY['dieu_hoa','bluetooth','camera_lui'],                                          1.40, 'car_rental'),
('Thuê xe - 4 chỗ có tài xế', 'Sedan 4 chỗ kèm tài xế',                             4,
  ARRAY['dieu_hoa','nuoc_uong'],                                                       1.60, 'car_rental'),
('Thuê xe - 7 chỗ có tài xế', 'MPV 7 chỗ kèm tài xế, phù hợp gia đình',             7,
  ARRAY['dieu_hoa','nuoc_uong','wifi'],                                                2.00, 'car_rental'),
('Thuê xe - 16 chỗ có tài xế','Xe 16 chỗ kèm tài xế, phù hợp đoàn nhỏ',            16,
  ARRAY['dieu_hoa','wifi','micro'],                                                    1.80, 'car_rental');


-- ----------------------------------------------------------------
-- F04. ROUTES - Tuyến đường
-- Giá nền (base_price_standard) = giá xe bus ghế ngồi phổ thông
-- Nguồn giá: Vexere.com, futabus.vn, queenbus.com.vn (2025)
-- ----------------------------------------------------------------
INSERT INTO routes (origin_id, destination_id, distance_km, duration_minutes, is_popular, base_price_standard, transport_type) VALUES

-- ══ XE BUS ══════════════════════════════════════════════════════
-- HN ↔ Sapa (350km, 6h qua cao tốc Nội Bài-Lào Cai)
(1,  6,  350,  360, true,  230000, 'bus'),
(6,  1,  350,  360, true,  230000, 'bus'),
-- HN ↔ Hải Phòng (120km, 2.5h)
(1,  2,  120,  150, true,   90000, 'bus'),
(2,  1,  120,  150, true,   90000, 'bus'),
-- HN ↔ Vinh (300km, 6h)
(1,  4,  300,  360, true,  150000, 'bus'),
(4,  1,  300,  360, false, 150000, 'bus'),
-- HN ↔ TP.HCM (1726km, 30h+)
(1,  12, 1726, 1800, false, 400000, 'all'),  -- 'all': có cả bus/tàu/bay
(12, 1,  1726, 1800, false, 400000, 'all'),
-- HN ↔ Đà Nẵng (800km, 15h)
(1,  7,  800,  930, false, 350000, 'all'),   -- 'all': có cả bus/tàu/bay
(7,  1,  800,  930, false, 350000, 'all'),
-- ĐN ↔ Huế (100km, 2h)
(7,  8,  100,  120, true,   80000, 'bus'),
(8,  7,  100,  120, true,   80000, 'bus'),
-- ĐN ↔ Hội An (30km, shuttle 50')
(7,  9,   30,   50, true,   50000, 'bus'),
(9,  7,   30,   50, false,  50000, 'bus'),
-- NT ↔ Đà Nẵng (540km, 10h)
(10, 7,  540,  600, true,  220000, 'bus'),
(7,  10, 540,  600, false, 220000, 'bus'),
-- SG ↔ Đà Lạt (310km, 7h)
(12, 11, 310,  400, true,  180000, 'bus'),
(11, 12, 310,  400, true,  180000, 'bus'),
-- SG ↔ Nha Trang (450km, 8h)
(12, 10, 450,  480, true,  200000, 'bus'),
(10, 12, 450,  480, false, 200000, 'bus'),
-- SG ↔ Vũng Tàu (125km, 2.5h)
(12, 14, 125,  150, true,  100000, 'bus'),
(14, 12, 125,  150, false, 100000, 'bus'),
-- SG ↔ Cần Thơ (180km, 3h)
(12, 13, 180,  210, false, 110000, 'bus'),
(13, 12, 180,  210, false, 110000, 'bus'),
-- SG ↔ Buôn Ma Thuột (360km, 7h)
(12, 17, 360,  420, false, 180000, 'bus'),
(17, 12, 360,  420, false, 180000, 'bus'),
-- SG ↔ Pleiku (550km, 10h)
(12, 18, 550,  600, false, 230000, 'bus'),
(18, 12, 550,  600, false, 230000, 'bus'),

-- ══ MÁY BAY ═════════════════════════════════════════════════════
-- Giá nền = giá Economy thực tế trung bình (VND)
(1,  12, 1726, 125, true,  1200000, 'plane'),  -- HN→SG ~2h05'
(12,  1, 1726, 125, true,  1200000, 'plane'),
(1,   7,  800,  80, true,   900000, 'plane'),  -- HN→ĐN ~1h20'
(7,   1,  800,  80, true,   900000, 'plane'),
(12,  7,  960,  80, true,   800000, 'plane'),  -- SG→ĐN ~1h20'
(7,  12,  960,  80, true,   800000, 'plane'),
(12, 11,  310,  55, true,   700000, 'plane'),  -- SG→ĐL ~55'
(11, 12,  310,  55, true,   700000, 'plane'),
(1,  10, 1280, 100, false,  900000, 'plane'),  -- HN→NT ~1h40'
(10,  1, 1280, 100, false,  900000, 'plane'),

-- ══ TÀU HỎA ═════════════════════════════════════════════════════
-- Giá nền = giá ghế ngồi cứng thực tế
(1,  12, 1726, 1980, false, 700000, 'train'),  -- HN→SG ~33h (SE1)
(12,  1, 1726, 1980, false, 700000, 'train'),
(1,   7,  800,  840, false, 420000, 'train'),  -- HN→ĐN ~14h
(7,   1,  800,  840, false, 420000, 'train'),
(12,  7,  960,  960, false, 460000, 'train'),  -- SG→ĐN ~16h
(7,  12,  960,  960, false, 460000, 'train'),
(12,  8, 1040, 1020, false, 490000, 'train'),  -- SG→Huế ~17h
(8,  12, 1040, 1020, false, 490000, 'train'),
(7,  10,  540,  480, true,  260000, 'train'),  -- ĐN→NT ~8h
(10,  7,  540,  480, true,  260000, 'train');


-- ----------------------------------------------------------------
-- F05. POPULAR_ROUTES_DISPLAY - Tuyến nổi bật trang chủ (19 tuyến)
-- ----------------------------------------------------------------
INSERT INTO popular_routes_display (label, origin_id, destination_id, display_order, category) VALUES
-- Xe bus
('Xe đi Sapa từ Hà Nội',            1,  6,  1, 'bus'),
('Xe đi Hải Phòng từ Hà Nội',       1,  2,  2, 'bus'),
('Xe đi Vinh từ Hà Nội',            1,  4,  3, 'bus'),
('Đà Nẵng đi Huế',                  7,  8,  4, 'bus'),
('Đà Nẵng đi Hội An',               7,  9,  5, 'shuttle'),
('Hải Phòng đi Hà Nội',             2,  1,  6, 'bus'),
-- Tàu hỏa
('Tàu Nha Trang → Đà Nẵng',        10,  7,  7, 'train'),
('Tàu Đà Nẵng → Huế',               7,  8,  8, 'train'),
('Tàu Hà Nội → Vinh',               1,  4,  9, 'train'),
('Tàu TP.HCM → Hà Nội',            12,  1, 10, 'train'),
('Tàu TP.HCM → Đà Nẵng',           12,  7, 11, 'train'),
-- Máy bay
('Bay Sài Gòn → Đà Lạt',           12, 11, 12, 'plane'),
('Bay Sài Gòn → Pleiku',            12, 18, 13, 'plane'),
('Bay Sài Gòn → Buôn Ma Thuột',     12, 17, 14, 'plane'),
('Bay Hà Nội → TP.HCM',             1, 12, 15, 'plane'),
('Bay TP.HCM → Đà Nẵng',           12,  7, 16, 'plane'),
('Bay Hà Nội → Đà Nẵng',            1,  7, 17, 'plane'),
-- Thuê xe
('Thuê xe Đà Nẵng đi Hội An',       7,  9, 18, 'car_rental'),
('Thuê xe TP.HCM đi Vũng Tàu',     12, 14, 19, 'car_rental');


-- ----------------------------------------------------------------
-- F06. HOLIDAY_SURCHARGES - Phụ thu ngày lễ 2025-2026
-- ----------------------------------------------------------------
INSERT INTO holiday_surcharges (name, start_date, end_date, surcharge_pct, note) VALUES
-- 2025
('Tết Nguyên Đán 2025',       '2025-01-25', '2025-02-05', 40, 'Cao điểm nhất năm, đặt trước 2-3 tuần'),
('Valentine 2025',             '2025-02-13', '2025-02-14', 10, 'Nhu cầu đi du lịch cặp đôi tăng'),
('Quốc tế Phụ nữ 8/3 2025',   '2025-03-07', '2025-03-09', 15, 'Phụ nữ đi chơi dịp 8/3'),
('Giỗ Tổ Hùng Vương 2025',    '2025-04-05', '2025-04-07', 20, '10/3 âm lịch'),
('Lễ 30/4 - 1/5 2025',        '2025-04-28', '2025-05-04', 35, 'Kỳ nghỉ lễ dài, cao điểm hè'),
('Quốc tế Thiếu nhi 1/6',     '2025-05-30', '2025-06-02', 10, 'Gia đình đi chơi cùng con'),
('Quốc khánh 2/9 2025',       '2025-09-01', '2025-09-03', 20, 'Nghỉ lễ 2/9'),
('Tết Dương lịch 2026',       '2025-12-30', '2026-01-02', 25, 'Nghỉ Tết Dương lịch'),
-- 2026
('Tết Nguyên Đán 2026',       '2026-02-15', '2026-02-25', 40, 'Tết Bính Ngọ'),
('Quốc tế Phụ nữ 8/3 2026',   '2026-03-07', '2026-03-09', 15, ''),
('Giỗ Tổ Hùng Vương 2026',    '2026-03-29', '2026-03-31', 20, ''),
('Lễ 30/4 - 1/5 2026',        '2026-04-28', '2026-05-04', 35, ''),
('Quốc khánh 2/9 2026',       '2026-09-01', '2026-09-03', 20, '');


-- ----------------------------------------------------------------
-- F07. TRIPS - Chuyến đi mẫu
-- Dùng calculate_ticket_price() để tính giá tự động theo ngày lễ
-- ----------------------------------------------------------------

-- ── XE BUS ──────────────────────────────────────────────────────

-- SG → Đà Lạt
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '1 day' + TIME '07:00',
  NOW()::DATE + INTERVAL '1 day' + TIME '14:00',
  'Văn phòng Thành Bưởi - 268 Lê Hồng Phong, Q.5, TP.HCM',
  'Bến xe Đà Lạt - 01 Tô Hiến Thành',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '1 day' + TIME '07:00'),
  40, 'scheduled', 'bus', '{}'
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=12 AND r.destination_id=11 AND r.transport_type='bus'
  AND o.slug='thanh-buoi' AND bt.name='Giường nằm 40 chỗ' LIMIT 1;

INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '1 day' + TIME '08:00',
  NOW()::DATE + INTERVAL '1 day' + TIME '14:30',
  'Văn phòng Thành Bưởi - 72 Trần Hưng Đạo, Q.1',
  '49-55 Phan Bội Châu, P.1, TP. Đà Lạt',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '1 day' + TIME '08:00'),
  9, 'scheduled', 'bus', '{}'
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=12 AND r.destination_id=11 AND r.transport_type='bus'
  AND o.slug='thanh-buoi' AND bt.name='Limousine 9 chỗ' LIMIT 1;

INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '1 day' + TIME '22:00',
  NOW()::DATE + INTERVAL '2 days' + TIME '05:00',
  'Bến xe Miền Đông, TP.HCM',
  'Bến xe Đà Lạt',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '1 day' + TIME '22:00'),
  34, 'scheduled', 'bus', '{}'
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=12 AND r.destination_id=11 AND r.transport_type='bus'
  AND o.slug='phuong-trang' AND bt.name='Giường nằm VIP 34 chỗ' LIMIT 1;

-- HN → Sapa
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '1 day' + TIME '21:00',
  NOW()::DATE + INTERVAL '2 days' + TIME '03:00',
  'Bến xe Mỹ Đình, Hà Nội',
  'Bến xe Sapa, Lào Cai',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '1 day' + TIME '21:00'),
  9, 'scheduled', 'bus', '{}'
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=1 AND r.destination_id=6 AND r.transport_type='bus'
  AND o.slug='sao-viet' AND bt.name='Limousine 9 chỗ' LIMIT 1;

INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '1 day' + TIME '20:00',
  NOW()::DATE + INTERVAL '2 days' + TIME '02:30',
  '208 Trần Quang Khải, Hoàn Kiếm, Hà Nội',
  'Chợ đêm Sapa',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '1 day' + TIME '20:00'),
  22, 'scheduled', 'bus', '{}'
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=1 AND r.destination_id=6 AND r.transport_type='bus'
  AND o.slug='queen-cafe' AND bt.name='Cabin đôi 22 phòng' LIMIT 1;

-- ── MÁY BAY ─────────────────────────────────────────────────────

-- Vietnam Airlines: HN → SG (Economy)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '2 days' + TIME '06:00',
  NOW()::DATE + INTERVAL '2 days' + TIME '08:05',
  'Sân bay Nội Bài (HAN) - Terminal 1',
  'Sân bay Tân Sơn Nhất (SGN) - Terminal 1',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '2 days' + TIME '06:00'),
  150, 'scheduled', 'plane',
  '{"flight_code":"VN123","terminal":"T1","gate":"G12","cabin_class":"economy","baggage_allowance_kg":23}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=1 AND r.destination_id=12 AND r.transport_type='plane'
  AND o.slug='vietnam-airlines' AND bt.name='Máy bay - Phổ thông' LIMIT 1;

-- Vietjet: SG → ĐN (Economy, không hành lý ký gửi)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '2 days' + TIME '08:30',
  NOW()::DATE + INTERVAL '2 days' + TIME '09:50',
  'Sân bay Tân Sơn Nhất (SGN) - Terminal 1',
  'Sân bay Đà Nẵng (DAD)',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '2 days' + TIME '08:30'),
  180, 'scheduled', 'plane',
  '{"flight_code":"VJ560","terminal":"T1","gate":"G05","cabin_class":"economy","baggage_allowance_kg":0}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=12 AND r.destination_id=7 AND r.transport_type='plane'
  AND o.slug='vietjet' AND bt.name='Máy bay - Phổ thông' LIMIT 1;

-- Bamboo: HN → ĐN (Business)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '2 days' + TIME '10:00',
  NOW()::DATE + INTERVAL '2 days' + TIME '11:20',
  'Sân bay Nội Bài (HAN) - Terminal 2',
  'Sân bay Đà Nẵng (DAD)',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '2 days' + TIME '10:00'),
  16, 'scheduled', 'plane',
  '{"flight_code":"QH203","terminal":"T2","gate":"G18","cabin_class":"business","baggage_allowance_kg":30}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=1 AND r.destination_id=7 AND r.transport_type='plane'
  AND o.slug='bamboo' AND bt.name='Máy bay - Thương gia' LIMIT 1;

-- ── TÀU HỎA ─────────────────────────────────────────────────────

-- VNR: SG → ĐN (SE1, Giường nằm mềm)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '2 days' + TIME '19:00',
  NOW()::DATE + INTERVAL '3 days' + TIME '11:00',
  'Ga Sài Gòn - 01 Nguyễn Thông, Q.3, TP.HCM',
  'Ga Đà Nẵng - 202 Hải Phòng, Đà Nẵng',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '2 days' + TIME '19:00'),
  40, 'scheduled', 'train',
  '{"train_code":"SE1","carriage_number":"7","seat_class":"giu_nam_mem","departure_station":"Ga Sài Gòn","arrival_station":"Ga Đà Nẵng"}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=12 AND r.destination_id=7 AND r.transport_type='train'
  AND o.slug='vnr' AND bt.name='Tàu - Giường nằm mềm' LIMIT 1;

-- VNR: ĐN → NT (SE2, Ghế ngồi mềm)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '2 days' + TIME '06:30',
  NOW()::DATE + INTERVAL '2 days' + TIME '14:30',
  'Ga Đà Nẵng - 202 Hải Phòng, Đà Nẵng',
  'Ga Nha Trang - 17 Thái Nguyên, Nha Trang',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '2 days' + TIME '06:30'),
  150, 'scheduled', 'train',
  '{"train_code":"SE2","carriage_number":"4","seat_class":"ghe_ngoi_mem","departure_station":"Ga Đà Nẵng","arrival_station":"Ga Nha Trang"}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=7 AND r.destination_id=10 AND r.transport_type='train'
  AND o.slug='vnr' AND bt.name='Tàu - Ghế ngồi mềm' LIMIT 1;

-- VNR: HN → SG (TN1, Giường nằm cứng)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '2 days' + TIME '19:30',
  NOW()::DATE + INTERVAL '4 days' + TIME '04:30',
  'Ga Hà Nội - 120 Lê Duẩn, Hoàn Kiếm, Hà Nội',
  'Ga Sài Gòn - 01 Nguyễn Thông, Q.3, TP.HCM',
  calculate_ticket_price(r.id, bt.id, NOW()::DATE + INTERVAL '2 days' + TIME '19:30'),
  60, 'scheduled', 'train',
  '{"train_code":"TN1","carriage_number":"12","seat_class":"giu_nam_cung","departure_station":"Ga Hà Nội","arrival_station":"Ga Sài Gòn"}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=1 AND r.destination_id=12 AND r.transport_type='train'
  AND o.slug='vnr' AND bt.name='Tàu - Giường nằm cứng' LIMIT 1;

-- ── THUÊ XE ─────────────────────────────────────────────────────

-- Mioto: Thuê xe 4 chỗ tự lái tại TP.HCM (3 ngày mẫu)
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, price_per_day, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '3 days' + TIME '08:00',
  NOW()::DATE + INTERVAL '6 days' + TIME '08:00',
  'Văn phòng Mioto - 123 Nguyễn Đình Chiểu, Q.3, TP.HCM',
  'Trả xe tại điểm đón hoặc thỏa thuận',
  650000, 650000,
  5, 'scheduled', 'car_rental',
  '{"has_driver":false,"price_per_day":650000,"min_rental_days":1,"car_model":"Toyota Vios 2023","fuel_policy":"full_to_full","pickup_location":"Văn phòng hoặc giao tận nơi (phí 50k)"}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=12 AND r.destination_id=14 AND r.transport_type='bus'
  AND o.slug='mioto' AND bt.name='Thuê xe - 4 chỗ tự lái' LIMIT 1;

-- Vinasun: Thuê xe 7 chỗ có tài xế tại Đà Nẵng
INSERT INTO trips (route_id, operator_id, bus_type_id, departure_time, arrival_time, pickup_address, dropoff_address, base_price, price_per_day, available_seats, status, transport_type, extra_info)
SELECT r.id, o.id, bt.id,
  NOW()::DATE + INTERVAL '3 days' + TIME '07:00',
  NOW()::DATE + INTERVAL '5 days' + TIME '07:00',
  'Sân bay Đà Nẵng hoặc khách sạn nội thành',
  'Trả xe tại điểm đón ban đầu',
  1800000, 1800000,
  3, 'scheduled', 'car_rental',
  '{"has_driver":true,"price_per_day":1800000,"min_rental_days":1,"car_model":"Toyota Innova 2022","fuel_policy":"included","pickup_location":"Đón tận nơi trong TP. Đà Nẵng"}'::JSONB
FROM routes r, operators o, bus_types bt
WHERE r.origin_id=7 AND r.destination_id=9 AND r.transport_type='bus'
  AND o.slug='vinasun-rental' AND bt.name='Thuê xe - 7 chỗ có tài xế' LIMIT 1;


-- ----------------------------------------------------------------
-- F08. PROMOTIONS - Mã khuyến mãi (8 mã)
-- ----------------------------------------------------------------
INSERT INTO promotions (code, title, description, discount_type, discount_value,
                        min_order_value, max_discount, start_date, end_date, usage_limit) VALUES
('HIUSGO10',   'Giảm 10% lần đầu đặt vé',
 'Chỉ áp dụng lần đặt vé đầu tiên. Không kết hợp mã khác.',
 'percent', 10, 100000, 50000,  CURRENT_DATE, CURRENT_DATE + 180, 5000),

('PUNU8T3',    'Ưu đãi 8/3 - Giảm 83.000đ',
 'Dành riêng ngày Quốc tế Phụ nữ 8/3.',
 'fixed', 83000, 200000, 83000, '2025-03-07', '2025-03-09', 2000),

('LE30T4',     'Lễ 30/4 - Giảm 15%',
 'Kỳ nghỉ lễ 30/4-1/5, vé khởi hành 26/4-30/4.',
 'percent', 15, 300000, 150000, '2025-04-20', '2025-04-30', 3000),

('SUMMER50K',  'Hè 2025 - Giảm 50.000đ',
 'Ưu đãi mùa hè, áp dụng tất cả tuyến.',
 'fixed', 50000, 150000, 50000, '2025-06-01', '2025-08-31', 8000),

('VIP20',      'Thành viên VIP - Giảm 20%',
 'Dành riêng thành viên VIP HiusGo, giảm tối đa 200.000đ.',
 'percent', 20, 300000, 200000, CURRENT_DATE, CURRENT_DATE + 365, 1000),

('TET2026',    'Tết Bính Ngọ 2026 - Giảm 100.000đ',
 'Đặt trước 20/1/2026 để nhận ưu đãi Tết.',
 'fixed', 100000, 400000, 100000, '2026-01-01', '2026-01-20', 2000),

('ONLINE15',   'Thanh toán online - Giảm 15.000đ',
 'Giảm khi thanh toán qua Momo, ZaloPay, VNPay.',
 'fixed', 15000, 80000, 15000,  CURRENT_DATE, CURRENT_DATE + 365, NULL),

('BIRTHDAY30K','Mừng sinh nhật - Giảm 30.000đ',
 'Tặng voucher 30.000đ nhân dịp sinh nhật.',
 'fixed', 30000, 100000, 30000, CURRENT_DATE, CURRENT_DATE + 365, NULL);


-- ================================================================
-- QUERY KIỂM TRA SAU KHI CHẠY
-- Copy từng câu vào SQL Editor để verify
-- ================================================================
/*

-- 1. Tổng quan số lượng theo loại phương tiện:
SELECT transport_type, COUNT(*) FROM trips    GROUP BY 1 ORDER BY 2 DESC;
SELECT transport_type, COUNT(*) FROM routes   GROUP BY 1 ORDER BY 2 DESC;
SELECT operator_type,  COUNT(*) FROM operators GROUP BY 1 ORDER BY 2 DESC;

-- 2. Danh sách chuyến đầy đủ:
SELECT origin_name || ' → ' || destination_name AS tuyen,
       transport_type, operator_name, vehicle_type_name,
       TO_CHAR(departure_time, 'HH24:MI DD/MM') AS gio_di,
       TO_CHAR(base_price, '999,999,999') || 'đ' AS gia
FROM v_trips_full ORDER BY transport_type, departure_time;

-- 3. Thông tin JSONB chuyến bay:
SELECT operator_name,
       extra_info->>'flight_code'          AS so_hieu,
       extra_info->>'cabin_class'          AS hang_ve,
       extra_info->>'baggage_allowance_kg' AS hanh_ly_kg,
       TO_CHAR(base_price, '999,999,999') || 'đ' AS gia
FROM v_trips_full WHERE transport_type = 'plane';

-- 4. Thông tin JSONB chuyến tàu:
SELECT operator_name,
       extra_info->>'train_code'      AS ma_tau,
       extra_info->>'carriage_number' AS so_toa,
       extra_info->>'seat_class'      AS hang_ghe,
       TO_CHAR(base_price, '999,999,999') || 'đ' AS gia
FROM v_trips_full WHERE transport_type = 'train';

-- 5. Thông tin JSONB thuê xe:
SELECT operator_name,
       extra_info->>'car_model'    AS loai_xe,
       extra_info->>'has_driver'   AS co_tai_xe,
       extra_info->>'price_per_day' AS gia_ngay,
       extra_info->>'fuel_policy'  AS nhien_lieu
FROM v_trips_full WHERE transport_type = 'car_rental';

-- 6. Tìm chuyến bay HN → SG ngày mai:
SELECT * FROM search_trips(1, 12, CURRENT_DATE + 2, 'plane');

-- 7. Bảng giá tuyến phổ biến:
SELECT diem_di, diem_den, km, loai_xe, phuong_tien,
       TO_CHAR(gia_thuong,  '999,999,999') || 'đ' AS "Ngày thường",
       TO_CHAR(gia_le_30_4, '999,999,999') || 'đ' AS "30/4 (+35%)",
       TO_CHAR(gia_tet,     '999,999,999') || 'đ' AS "Tết (+40%)"
FROM v_price_matrix LIMIT 30;

-- 8. Mã khuyến mãi còn hiệu lực:
SELECT code, title, discount_type, discount_value, end_date, used_count, usage_limit
FROM promotions WHERE is_active = true AND end_date >= CURRENT_DATE ORDER BY end_date;

-- 9. Ngày lễ sắp tới:
SELECT name, start_date, end_date, surcharge_pct || '%' AS tang_gia
FROM holiday_surcharges WHERE end_date >= CURRENT_DATE ORDER BY start_date;

*/


-- ================================================================
-- RESET DATABASE (dùng khi cần chạy lại từ đầu)
-- ⚠️ XÓA TOÀN BỘ DỮ LIỆU - chỉ dùng trên môi trường dev
-- ================================================================
/*

DROP VIEW  IF EXISTS v_trips_full, v_price_matrix;
DROP TABLE IF EXISTS trip_price_history, reviews, bookings, seats, trips,
                     popular_routes_display, promotions, holiday_surcharges,
                     routes, bus_types, operators, users, locations CASCADE;
DROP FUNCTION IF EXISTS update_updated_at, generate_booking_code,
                        handle_new_user, update_available_seats,
                        calculate_ticket_price, increment_promo_usage, search_trips CASCADE;

*/

-- ================================================================
-- END OF FILE - HIUSGO_DATABASE_COMPLETE.sql
-- ================================================================