-- =============================================================================
-- migration_online_sessions.sql
-- Mục đích: Tạo bảng online_sessions cho phòng học trực tuyến (video call)
--           với mã phòng duy nhất để học viên tham gia.
-- =============================================================================

USE elearning_db;

-- -----------------------------------------------------------------------------
-- Bảng online_sessions: Phòng học online theo lớp
-- room_code: Mã phòng duy nhất toàn hệ thống
-- is_active: Phòng đang mở hay đã đóng
-- ended_at: Thời điểm kết thúc buổi học (NULL nếu đang diễn ra)
-- -----------------------------------------------------------------------------
CREATE TABLE online_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề buổi học online
  room_code VARCHAR(100) NOT NULL UNIQUE,               -- Mã phòng (ràng buộc UNIQUE)
  created_by INT NOT NULL,                              -- FK → users (giáo viên tạo)
  is_active BOOLEAN DEFAULT TRUE,                       -- Trạng thái phòng hoạt động
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- Thời điểm tạo
  ended_at TIMESTAMP NULL,                              -- Thời điểm kết thúc
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
