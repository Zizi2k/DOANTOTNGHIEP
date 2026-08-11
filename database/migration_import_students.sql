-- =============================================================================
-- migration_import_students.sql
-- Mục đích: Bổ sung thông tin liên hệ (phone, zalo) cho users và mã lớp (code)
--           cho classes; tự sinh mã lớp LOP{id} cho các lớp chưa có mã.
-- Dùng khi import học viên từ Excel hoặc nguồn ngoài.
-- =============================================================================

USE elearning_db;

-- Nhóm cột liên hệ trên bảng users
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER avatar_url;   -- Số điện thoại
ALTER TABLE users ADD COLUMN zalo VARCHAR(100) NULL AFTER phone;        -- Liên hệ Zalo

-- Thêm mã lớp vào bảng classes
ALTER TABLE classes ADD COLUMN code VARCHAR(50) NULL AFTER name;

-- Gán mã mặc định LOP{id} cho các lớp chưa có mã
UPDATE classes SET code = CONCAT('LOP', id) WHERE code IS NULL OR code = '';
