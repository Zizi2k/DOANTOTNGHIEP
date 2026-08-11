-- =============================================================================
-- setup_ql_hocvien.sql
-- Mục đích: Tạo database mới ql_hocvien với bộ mã UTF-8 đầy đủ (utf8mb4)
--           cho project HUYNHGIA_QLHV, tách biệt khỏi database cũ elearning_db.
-- Chạy: mysql -u root -p < database/setup_ql_hocvien.sql
-- Sau đó: import schema hoặc clone dữ liệu từ DB cũ (xem hướng dẫn bên dưới).
-- =============================================================================

-- Tạo database mới với charset hỗ trợ tiếng Việt đầy đủ
CREATE DATABASE IF NOT EXISTS ql_hocvien
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Hướng dẫn bước tiếp theo sau khi chạy file này:
-- Copy dữ liệu từ DB cũ (nếu có):
--   node backend/scripts/clone-database.js --from elearning_db --to ql_hocvien
-- Hoặc import schema mới:
--   mysql -u root -p ql_hocvien < database/schema.sql
