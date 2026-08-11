-- =============================================================================
-- migration_teacher_schedule.sql
-- Mục đích: Tạo module lịch dạy giáo viên — slot thời gian và đặt lịch học viên.
-- Bảng teacher_schedule_slots: Giáo viên đánh dấu slot trống/bận theo lớp.
-- Bảng student_schedule_bookings: Học viên đặt slot trong lịch giáo viên.
-- =============================================================================

USE elearning_db;

-- -----------------------------------------------------------------------------
-- Bảng teacher_schedule_slots: Khung giờ dạy theo lớp và ngày
-- is_available: 1=slot trống (học viên có thể đặt), 0=slot bận
-- Ràng buộc unique_class_slot: Một lớp không trùng slot (ngày + giờ bắt đầu)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_schedule_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  slot_date DATE NOT NULL,                              -- Ngày dạy
  start_time TIME NOT NULL,                             -- Giờ bắt đầu
  end_time TIME NOT NULL,                               -- Giờ kết thúc
  is_available TINYINT(1) NOT NULL DEFAULT 0,           -- Slot còn trống để đặt
  updated_by INT NOT NULL,                              -- FK → users (giáo viên cập nhật)
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_class_slot (class_id, slot_date, start_time)  -- Index: không trùng slot
);

-- -----------------------------------------------------------------------------
-- Bảng student_schedule_bookings: Học viên đặt lịch vào slot
-- Ràng buộc unique_slot_student: Mỗi học viên chỉ đặt một lần trong slot
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_schedule_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  slot_id INT NOT NULL,                                 -- FK → teacher_schedule_slots
  student_id INT NOT NULL,                              -- FK → users (học viên)
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Thời điểm đặt lịch
  FOREIGN KEY (slot_id) REFERENCES teacher_schedule_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slot_student (slot_id, student_id)  -- Index: một học viên/slot
);
