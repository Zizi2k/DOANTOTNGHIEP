-- =============================================================================
-- migration_tuition.sql
-- Mục đích: Tạo module quản lý học phí — danh mục giảm giá, hồ sơ học phí,
--           giao dịch thu tiền và kỳ thu theo tháng/môn.
-- Chạy độc lập trên database đã có bảng users và classes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Bảng fee_discounts: Danh mục mức giảm học phí
-- discount_type: fixed=giảm cố định VNĐ, percent=giảm theo phần trăm
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_discounts (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  name VARCHAR(100) NOT NULL,                           -- Tên chương trình giảm
  discount_type ENUM('fixed', 'percent') NOT NULL DEFAULT 'fixed',
  discount_value DECIMAL(12, 2) NOT NULL DEFAULT 0,     -- Giá trị giảm
  default_reason TEXT,                                  -- Lý do mặc định khi áp dụng
  is_active BOOLEAN DEFAULT TRUE,                       -- Còn hiệu lực
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Bảng tuition_profiles: Hồ sơ học phí theo học viên và môn học
-- Ràng buộc unique_student_subject: Một mã học viên chỉ một hồ sơ trên mỗi môn
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  student_code VARCHAR(50) NOT NULL,                    -- Mã học viên
  user_id INT DEFAULT NULL,                             -- FK → users (liên kết tài khoản)
  fullname VARCHAR(100) NOT NULL,                       -- Họ tên
  subject ENUM('chinese', 'english', 'computer', 'vietnamese') NOT NULL,
  class_id INT DEFAULT NULL,                            -- FK → classes
  class_label VARCHAR(100),                             -- Nhãn lớp hiển thị
  enrichment_class VARCHAR(100),                        -- Lớp bồi dưỡng
  current_class VARCHAR(100),                           -- Lớp hiện tại
  phone VARCHAR(20),                                    -- Số điện thoại
  zalo VARCHAR(100),                                    -- Zalo
  -- Nhóm cột học phí
  base_fee DECIMAL(12, 2) DEFAULT 0,                    -- Học phí gốc
  fee_before_discount DECIMAL(12, 2) DEFAULT 0,         -- Trước giảm
  fee_after_discount DECIMAL(12, 2) DEFAULT 0,          -- Sau giảm
  book_fee DECIMAL(12, 2) DEFAULT 0,                    -- Phí sách giáo khoa
  discount_id INT DEFAULT NULL,                         -- FK → fee_discounts
  discount_reason TEXT,                                 -- Lý do giảm cụ thể
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_subject (student_code, subject),  -- Index: duy nhất mã/môn
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (discount_id) REFERENCES fee_discounts(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- Bảng tuition_payments: Giao dịch thu học phí hoặc phí sách
-- payment_type: tuition=học phí, book=phí sách
-- method: cash=tiền mặt, transfer=chuyển khoản
-- period_month: Kỳ thu dạng YYYY-MM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  profile_id INT NOT NULL,                              -- FK → tuition_profiles
  payment_type ENUM('tuition', 'book') NOT NULL,        -- Loại khoản thu
  amount DECIMAL(12, 2) NOT NULL,                       -- Số tiền thu
  method ENUM('cash', 'transfer') NOT NULL DEFAULT 'cash',
  payment_date DATE NOT NULL,                           -- Ngày thu tiền
  period_month CHAR(7) NOT NULL,                        -- Kỳ thu (YYYY-MM)
  note TEXT,                                            -- Ghi chú
  recorded_by INT NOT NULL,                             -- FK → users (người ghi nhận)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES tuition_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng tuition_periods: Kỳ thu học phí theo tháng và môn
-- Ràng buộc unique_period_subject: Một kỳ duy nhất trên mỗi tháng/môn
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_periods (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  period_month CHAR(7) NOT NULL,                        -- Tháng kỳ thu (YYYY-MM)
  subject ENUM('chinese', 'english', 'computer', 'vietnamese') NOT NULL,
  title VARCHAR(255),                                   -- Tiêu đề kỳ thu
  note TEXT,                                            -- Ghi chú
  created_by INT NOT NULL,                              -- FK → users (người tạo kỳ)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period_subject (period_month, subject),  -- Index: duy nhất tháng/môn
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
