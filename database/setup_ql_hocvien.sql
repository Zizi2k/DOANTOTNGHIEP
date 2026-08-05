-- Tạo database mới cho project HUYNHGIA_QLHV
CREATE DATABASE IF NOT EXISTS ql_hocvien
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Sau khi chạy file này, copy dữ liệu từ DB cũ (nếu có):
--   node backend/scripts/clone-database.js --from elearning_db --to ql_hocvien
-- Hoặc import schema mới:
--   mysql -u root -p ql_hocvien < database/schema.sql
