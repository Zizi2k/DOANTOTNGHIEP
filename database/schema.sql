-- =============================================================================
-- schema.sql
-- Mục đích: Tạo cơ sở dữ liệu elearning_db và toàn bộ bảng cốt lõi của hệ
--           thống quản lý học viên HUYNHGIA_QLHV (người dùng, lớp, bài học,
--           quiz, bài tập, thảo luận, điểm danh, học trực tuyến, học phí).
-- Chạy: mysql -u root -p < database/schema.sql
-- =============================================================================

-- Tạo và chọn database làm việc
CREATE DATABASE IF NOT EXISTS elearning_db;
USE elearning_db;

-- -----------------------------------------------------------------------------
-- Bảng users: Tài khoản người dùng (admin, giáo viên, học viên)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  fullname VARCHAR(100) NOT NULL,                       -- Họ và tên
  username VARCHAR(50) NOT NULL UNIQUE,                 -- Tên đăng nhập (duy nhất)
  code VARCHAR(50) NOT NULL,                            -- Mã người dùng (HSxxx, GVxxx...)
  role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',  -- Vai trò
  status BOOLEAN DEFAULT TRUE,                          -- Trạng thái hoạt động
  avatar_url TEXT,                                      -- URL ảnh đại diện
  phone VARCHAR(20),                                    -- Số điện thoại
  zalo VARCHAR(100),                                    -- Liên hệ Zalo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP        -- Thời điểm tạo
);

-- -----------------------------------------------------------------------------
-- Bảng classes: Lớp học
-- -----------------------------------------------------------------------------
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  name VARCHAR(100) NOT NULL,                           -- Tên lớp
  code VARCHAR(50),                                     -- Mã lớp
  description TEXT,                                     -- Mô tả lớp
  subject ENUM('chinese', 'english', 'computer', 'vietnamese') NULL,  -- Môn học
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP        -- Thời điểm tạo
);

-- -----------------------------------------------------------------------------
-- Bảng class_members: Thành viên thuộc lớp (giáo viên/học viên)
-- Ràng buộc: Mỗi cặp (class_id, user_id) chỉ xuất hiện một lần
-- -----------------------------------------------------------------------------
CREATE TABLE class_members (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  user_id INT NOT NULL,                                 -- FK → users
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (class_id, user_id)          -- Index: không trùng thành viên trong lớp
);

-- -----------------------------------------------------------------------------
-- Bảng lessons: Bài học / tài liệu trong lớp
-- -----------------------------------------------------------------------------
CREATE TABLE lessons (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề bài học
  description TEXT,                                     -- Mô tả
  file_url TEXT,                                        -- Đường dẫn file đính kèm
  file_type VARCHAR(20),                                -- Loại file (pdf, video...)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng quizzes: Bài kiểm tra trắc nghiệm
-- -----------------------------------------------------------------------------
CREATE TABLE quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề quiz
  time_limit INT DEFAULT 30,                            -- Thời gian làm bài (phút)
  visible_from DATETIME NULL,                           -- Thời điểm bắt đầu hiển thị
  is_hidden TINYINT(1) NOT NULL DEFAULT 0,              -- Ẩn/hiện quiz
  show_results TINYINT(1) NOT NULL DEFAULT 0,           -- Cho phép học viên xem đáp án
  student_access_mode ENUM('all', 'selected') NOT NULL DEFAULT 'all',  -- Phạm vi học viên được làm
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng quiz_allowed_students: Danh sách học viên được phép làm quiz (khi mode = selected)
-- Khóa chính ghép: (quiz_id, student_id)
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_allowed_students (
  quiz_id INT NOT NULL,                                 -- FK → quizzes
  student_id INT NOT NULL,                              -- FK → users (học viên)
  PRIMARY KEY (quiz_id, student_id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng questions: Câu hỏi trắc nghiệm thuộc quiz
-- -----------------------------------------------------------------------------
CREATE TABLE questions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  quiz_id INT NOT NULL,                                 -- FK → quizzes
  question TEXT NOT NULL,                               -- Nội dung câu hỏi
  optionA TEXT NOT NULL,                                -- Đáp án A
  optionB TEXT NOT NULL,                                -- Đáp án B
  optionC TEXT NOT NULL,                                -- Đáp án C
  optionD TEXT NOT NULL,                                -- Đáp án D
  answer CHAR(1) NOT NULL,                              -- Đáp án đúng (A/B/C/D)
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng quiz_submissions: Bài nộp quiz của học viên
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  quiz_id INT NOT NULL,                                 -- FK → quizzes
  student_id INT NOT NULL,                              -- FK → users (học viên)
  score FLOAT DEFAULT 0,                                -- Điểm đạt được
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Thời điểm nộp bài
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng quiz_answers: Chi tiết câu trả lời từng câu trong bài nộp
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  submission_id INT NOT NULL,                           -- FK → quiz_submissions
  question_id INT NOT NULL,                             -- FK → questions
  selected_answer CHAR(1),                              -- Đáp án học viên chọn
  FOREIGN KEY (submission_id) REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng assignments: Bài tập / bài nộp file
-- -----------------------------------------------------------------------------
CREATE TABLE assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề bài tập
  description TEXT,                                     -- Mô tả yêu cầu
  file_url TEXT,                                        -- File đề bài đính kèm
  file_type VARCHAR(50),                                -- Loại file đề bài
  deadline DATETIME,                                    -- Hạn nộp
  visible_from DATETIME NULL,                           -- Thời điểm hiển thị
  is_hidden TINYINT(1) NOT NULL DEFAULT 0,              -- Ẩn/hiện bài tập
  student_access_mode ENUM('all', 'selected') NOT NULL DEFAULT 'all',  -- Phạm vi học viên
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng assignment_allowed_students: Học viên được phép nộp bài (khi mode = selected)
-- Khóa chính ghép: (assignment_id, student_id)
-- -----------------------------------------------------------------------------
CREATE TABLE assignment_allowed_students (
  assignment_id INT NOT NULL,                           -- FK → assignments
  student_id INT NOT NULL,                              -- FK → users (học viên)
  PRIMARY KEY (assignment_id, student_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng submissions: Bài nộp của học viên cho assignment
-- -----------------------------------------------------------------------------
CREATE TABLE submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  assignment_id INT NOT NULL,                           -- FK → assignments
  student_id INT NOT NULL,                              -- FK → users (học viên)
  file_url TEXT,                                        -- File bài nộp
  score FLOAT,                                          -- Điểm chấm
  feedback TEXT,                                        -- Nhận xét của giáo viên
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Thời điểm nộp
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng discussions: Chủ đề thảo luận trong lớp
-- -----------------------------------------------------------------------------
CREATE TABLE discussions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  user_id INT NOT NULL,                                 -- FK → users (người tạo)
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề chủ đề
  content TEXT NOT NULL,                                -- Nội dung
  image_url VARCHAR(500) DEFAULT NULL,                  -- Ảnh đính kèm
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng discussion_comments: Bình luận trong chủ đề thảo luận
-- parent_id: Hỗ trợ trả lời lồng nhau (reply)
-- -----------------------------------------------------------------------------
CREATE TABLE discussion_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  discussion_id INT NOT NULL,                           -- FK → discussions
  user_id INT NOT NULL,                                 -- FK → users (người bình luận)
  content TEXT NOT NULL,                                -- Nội dung bình luận
  image_url VARCHAR(500) DEFAULT NULL,                  -- Ảnh đính kèm
  parent_id INT DEFAULT NULL,                           -- FK → comment cha (reply)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES discussion_comments(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng discussion_likes: Lượt thích chủ đề thảo luận
-- Ràng buộc: Mỗi user chỉ like một discussion một lần
-- -----------------------------------------------------------------------------
CREATE TABLE discussion_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  discussion_id INT NOT NULL,                           -- FK → discussions
  user_id INT NOT NULL,                                 -- FK → users
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (discussion_id, user_id)       -- Index: không like trùng
);

-- -----------------------------------------------------------------------------
-- Bảng attendance_sessions: Buổi điểm danh theo ngày trong lớp
-- Ràng buộc: Mỗi lớp chỉ có một session trên mỗi ngày
-- -----------------------------------------------------------------------------
CREATE TABLE attendance_sessions (
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
-- Bảng attendance_records: Trạng thái điểm danh từng học viên trong buổi
-- status: present=có mặt, absent=vắng, late=muộn, excused=vắng có phép
-- Ràng buộc: Mỗi học viên chỉ có một bản ghi trong mỗi session
-- -----------------------------------------------------------------------------
CREATE TABLE attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  session_id INT NOT NULL,                              -- FK → attendance_sessions
  student_id INT NOT NULL,                              -- FK → users (học viên)
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'present',
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_record (session_id, student_id)     -- Index: một bản ghi/học viên/buổi
);

-- -----------------------------------------------------------------------------
-- Bảng online_sessions: Phòng học trực tuyến (video call)
-- room_code: Mã phòng duy nhất để tham gia
-- -----------------------------------------------------------------------------
CREATE TABLE online_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  class_id INT NOT NULL,                                -- FK → classes
  title VARCHAR(255) NOT NULL,                          -- Tiêu đề buổi học online
  room_code VARCHAR(100) NOT NULL UNIQUE,               -- Mã phòng (duy nhất toàn hệ thống)
  created_by INT NOT NULL,                              -- FK → users (giáo viên tạo)
  is_active BOOLEAN DEFAULT TRUE,                       -- Phòng đang hoạt động
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Thời điểm tạo phòng
  ended_at TIMESTAMP NULL,                              -- Thời điểm kết thúc
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng fee_discounts: Danh mục mức giảm học phí
-- discount_type: fixed=giảm cố định (VNĐ), percent=giảm theo phần trăm
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_discounts (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  name VARCHAR(100) NOT NULL,                           -- Tên chương trình giảm
  discount_type ENUM('fixed', 'percent') NOT NULL DEFAULT 'fixed',
  discount_value DECIMAL(12, 2) NOT NULL DEFAULT 0,     -- Giá trị giảm
  default_reason TEXT,                                  -- Lý do mặc định
  is_active BOOLEAN DEFAULT TRUE,                       -- Còn áp dụng hay không
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Bảng tuition_profiles: Hồ sơ học phí theo học viên và môn học
-- Ràng buộc: Mỗi cặp (student_code, subject) chỉ có một hồ sơ
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  student_code VARCHAR(50) NOT NULL,                    -- Mã học viên
  user_id INT DEFAULT NULL,                             -- FK → users (liên kết tài khoản)
  fullname VARCHAR(100) NOT NULL,                       -- Họ tên học viên
  subject ENUM('chinese', 'english', 'computer', 'vietnamese') NOT NULL,  -- Môn học
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
  book_fee DECIMAL(12, 2) DEFAULT 0,                    -- Phí sách
  discount_id INT DEFAULT NULL,                         -- FK → fee_discounts
  discount_reason TEXT,                                 -- Lý do giảm cụ thể
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_subject (student_code, subject),  -- Index: một hồ sơ/mã/môn
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (discount_id) REFERENCES fee_discounts(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- Bảng tuition_payments: Giao dịch thu học phí / phí sách
-- payment_type: tuition=học phí, book=phí sách
-- period_month: Kỳ thu dạng YYYY-MM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  profile_id INT NOT NULL,                              -- FK → tuition_profiles
  payment_type ENUM('tuition', 'book') NOT NULL,        -- Loại khoản thu
  amount DECIMAL(12, 2) NOT NULL,                       -- Số tiền
  method ENUM('cash', 'transfer') NOT NULL DEFAULT 'cash',  -- Hình thức: tiền mặt/chuyển khoản
  payment_date DATE NOT NULL,                           -- Ngày thu
  period_month CHAR(7) NOT NULL,                        -- Kỳ thu (YYYY-MM)
  note TEXT,                                            -- Ghi chú
  recorded_by INT NOT NULL,                             -- FK → users (người ghi nhận)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES tuition_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bảng tuition_periods: Kỳ thu học phí theo tháng và môn
-- Ràng buộc: Mỗi cặp (period_month, subject) chỉ có một kỳ
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tuition_periods (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  period_month CHAR(7) NOT NULL,                          -- Tháng kỳ thu (YYYY-MM)
  subject ENUM('chinese', 'english', 'computer', 'vietnamese') NOT NULL,
  title VARCHAR(255),                                   -- Tiêu đề kỳ thu
  note TEXT,                                            -- Ghi chú
  created_by INT NOT NULL,                              -- FK → users (người tạo)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period_subject (period_month, subject),  -- Index: một kỳ/tháng/môn
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Dữ liệu mẫu: Tài khoản, lớp và thành viên để demo hệ thống
-- -----------------------------------------------------------------------------
INSERT INTO users (fullname, username, code, role) VALUES
('Quản trị viên', 'admin', 'ADMIN001', 'admin'),
('Nguyễn Văn Giáo', 'nguyenvangiao', 'GV001', 'teacher'),
('Nguyễn Văn A', 'nguyenvana', 'HS001', 'student'),
('Trần Thị B', 'tranthib', 'HS002', 'student');

INSERT INTO classes (name, code, description) VALUES
('Lập trình Web', 'LOP1', 'Khóa học HTML, CSS, JavaScript và React'),
('Mạng máy tính', 'LOP2', 'Kiến thức cơ bản về mạng máy tính'),
('Cơ sở dữ liệu', 'LOP3', 'MySQL, thiết kế CSDL và truy vấn');

INSERT INTO class_members (class_id, user_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 3), (3, 4);
