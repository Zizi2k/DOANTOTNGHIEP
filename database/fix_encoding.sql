-- =============================================================================
-- fix_encoding.sql
-- Mục đích: Sửa lỗi hiển thị tiếng Việt (encoding) trên dữ liệu mẫu đã bị
--           lưu sai charset trong bảng classes và users.
-- Chạy trên database đang dùng: USE elearning_db trước khi UPDATE.
-- =============================================================================

USE elearning_db;

-- Sửa tên và mô tả lớp học bị lỗi encoding
UPDATE classes SET name = 'Lập trình Web', description = 'Khóa học HTML, CSS, JavaScript và React' WHERE id = 1;
UPDATE classes SET name = 'Mạng máy tính', description = 'Kiến thức cơ bản về mạng máy tính' WHERE id = 2;
UPDATE classes SET name = 'Cơ sở dữ liệu', description = 'MySQL, thiết kế CSDL và truy vấn' WHERE id = 3;

-- Sửa họ tên người dùng mẫu bị lỗi encoding
UPDATE users SET fullname = 'Quản trị viên' WHERE username = 'admin';
UPDATE users SET fullname = 'Nguyễn Văn Giáo' WHERE username = 'nguyenvangiao';
UPDATE users SET fullname = 'Nguyễn Văn A' WHERE username = 'nguyenvana';
UPDATE users SET fullname = 'Trần Thị B' WHERE username = 'tranthib';
