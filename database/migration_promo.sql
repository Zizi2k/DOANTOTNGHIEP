-- =============================================================================
-- migration_promo.sql
-- Mục đích: Tạo module quảng cáo / marketing — banner, khóa học khuyến mãi
--           và đăng ký quan tâm. Phạm vi hiển thị theo chi nhánh HG | EG | all.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Bảng promo_banners: Banner quảng cáo trên trang chủ / landing
-- branch_scope: HG=LHG, EG=EGC, all=hiển thị toàn hệ thống
-- sort_order: Thứ tự hiển thị (số nhỏ lên trước)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promo_banners (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề banner
  subtitle TEXT NULL,                                   -- Phụ đề
  image_url TEXT NULL,                                  -- Ảnh banner
  cta_label VARCHAR(100) NULL,                          -- Nút kêu gọi hành động (VD: Đăng ký ngay)
  link_url VARCHAR(500) NULL,                           -- Link khi click
  branch_scope ENUM('HG', 'EG', 'all') NOT NULL DEFAULT 'all',
  sort_order INT NOT NULL DEFAULT 0,                    -- Thứ tự sắp xếp
  is_active TINYINT(1) NOT NULL DEFAULT 1,              -- Đang hiển thị hay ẩn
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Bảng promo_courses: Khóa học khuyến mãi / ưu đãi
-- Liên kết với lớp qua class_code (khớp mã lớp trong bảng classes)
-- discount_type: percent=giảm %, fixed=giảm cố định VNĐ
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promo_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  title VARCHAR(255) NOT NULL,                          -- Tên khóa học
  description TEXT NULL,                                -- Mô tả
  image_url TEXT NULL,                                  -- Ảnh minh họa
  highlight VARCHAR(255) NULL,                          -- Điểm nổi bật (tagline)
  branch_scope ENUM('HG', 'EG') NOT NULL,                 -- Chi nhánh áp dụng
  -- Nhóm cột giá và khuyến mãi
  original_price DECIMAL(12,0) NULL,                    -- Giá gốc
  discount_type ENUM('percent', 'fixed') NULL,            -- Loại giảm giá
  discount_value DECIMAL(12,2) NULL,                    -- Giá trị giảm
  sale_price DECIMAL(12,0) NULL,                        -- Giá sau giảm
  registration_enabled TINYINT(1) NOT NULL DEFAULT 1,   -- Cho phép đăng ký
  class_code VARCHAR(50) NULL,                          -- Mã lớp liên kết
  sort_order INT NOT NULL DEFAULT 0,                    -- Thứ tự hiển thị
  is_active TINYINT(1) NOT NULL DEFAULT 1,              -- Đang hiển thị
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_promo_courses_scope (branch_scope, is_active, sort_order)  -- Index: lọc theo chi nhánh và trạng thái
);

-- Ghi chú migration bổ sung (nếu bảng đã tồn tại thiếu cột):
-- Liên kết promo course → class qua mã lớp:
-- ALTER TABLE promo_courses ADD COLUMN class_code VARCHAR(50) NULL;
-- Nếu promo_courses đã tồn tại thiếu cột giá:
-- ALTER TABLE promo_courses ADD COLUMN original_price DECIMAL(12,0) NULL;
-- ALTER TABLE promo_courses ADD COLUMN discount_type ENUM('percent','fixed') NULL;
-- ALTER TABLE promo_courses ADD COLUMN discount_value DECIMAL(12,2) NULL;
-- ALTER TABLE promo_courses ADD COLUMN sale_price DECIMAL(12,0) NULL;
-- ALTER TABLE promo_courses ADD COLUMN registration_enabled TINYINT(1) NOT NULL DEFAULT 1;

-- -----------------------------------------------------------------------------
-- Bảng promo_registrations: Đăng ký quan tâm khóa học khuyến mãi
-- registrant_user_id: Tài khoản đăng ký (phụ huynh / học viên)
-- student_user_id: Học viên được đăng ký hộ (nếu khác người đăng ký)
-- status: pending→contacted→approved/rejected/cancelled
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promo_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  course_id INT NOT NULL,                               -- FK → promo_courses
  registrant_user_id INT NOT NULL,                      -- FK → users (người đăng ký)
  student_user_id INT NULL,                             -- FK → users (học viên, có thể NULL)
  fullname VARCHAR(255) NULL,                           -- Họ tên (khi chưa có tài khoản)
  phone VARCHAR(30) NULL,                               -- Số điện thoại
  zalo VARCHAR(100) NULL,                               -- Zalo
  note TEXT NULL,                                       -- Ghi chú
  status ENUM('pending','contacted','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  original_price DECIMAL(12,0) NULL,                    -- Giá gốc tại thời điểm đăng ký
  sale_price DECIMAL(12,0) NULL,                        -- Giá ưu đãi tại thời điểm đăng ký
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES promo_courses(id) ON DELETE CASCADE,
  FOREIGN KEY (registrant_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_promo_reg_status (status, created_at),      -- Index: lọc theo trạng thái và thời gian
  INDEX idx_promo_reg_course (course_id)                -- Index: tra cứu theo khóa học
);
