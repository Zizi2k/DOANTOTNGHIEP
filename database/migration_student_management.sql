-- =============================================================================
-- migration_student_management.sql
-- Mục đích: Tạo bảng training_courses (khóa đào tạo) và bổ sung cột quản lý
--           học viên trên tuition_profiles (course_id, start_date, end_date).
-- =============================================================================

USE elearning_db;

-- -----------------------------------------------------------------------------
-- Bảng training_courses: Danh mục khóa đào tạo theo môn
-- duration_months: Thời lượng khóa (tháng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  name VARCHAR(100) NOT NULL,                           -- Tên khóa đào tạo
  subject ENUM('chinese', 'english', 'computer', 'vietnamese') NOT NULL,  -- Môn học
  duration_months INT NOT NULL DEFAULT 3,               -- Thời lượng (tháng)
  description TEXT,                                     -- Mô tả khóa
  is_active BOOLEAN DEFAULT TRUE,                       -- Khóa còn mở đăng ký
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bổ sung cột quản lý học viên trên hồ sơ học phí
ALTER TABLE tuition_profiles
  ADD COLUMN course_id INT NULL AFTER subject,          -- FK → training_courses
  ADD COLUMN start_date DATE NULL AFTER discount_reason, -- Ngày bắt đầu học
  ADD COLUMN end_date DATE NULL AFTER start_date;       -- Ngày kết thúc khóa

-- Ràng buộc khóa ngoại: course_id → training_courses
ALTER TABLE tuition_profiles
  ADD CONSTRAINT fk_tuition_course
  FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE SET NULL;
