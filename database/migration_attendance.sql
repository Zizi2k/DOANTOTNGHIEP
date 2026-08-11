-- =============================================================================
-- migration_attendance.sql
-- Mục đích: Tạo module điểm danh — bảng buổi điểm danh (attendance_sessions)
--           và bản ghi trạng thái từng học viên (attendance_records).
-- =============================================================================

USE elearning_db;

-- -----------------------------------------------------------------------------
-- Bảng attendance_sessions: Buổi điểm danh theo ngày trong lớp
-- Ràng buộc unique_session: Mỗi lớp chỉ có một buổi điểm danh trên mỗi ngày
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  session_date DATE NOT NULL,                           -- Ngày điểm danh
  note TEXT,                                            -- Ghi chú buổi học
  created_by INT NOT NULL,                              -- FK → users (giáo viên tạo)
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Thời điểm gửi điểm danh
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session (class_id, session_date)    -- Index: một buổi/ngày/lớp
);

-- -----------------------------------------------------------------------------
-- Bảng attendance_records: Trạng thái điểm danh từng học viên
-- status: present=có mặt, absent=vắng, late=muộn, excused=vắng có phép
-- Ràng buộc unique_record: Mỗi học viên chỉ một bản ghi trong mỗi buổi
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  session_id INT NOT NULL,                              -- FK → attendance_sessions
  student_id INT NOT NULL,                              -- FK → users (học viên)
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'present',
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_record (session_id, student_id)     -- Index: một bản ghi/học viên/buổi
);
