-- =============================================================================
-- migration_add_avatar.sql
-- Mục đích: Thêm cột avatar_url vào bảng users để lưu đường dẫn ảnh đại diện.
-- Chạy một lần trên database hiện có (elearning_db).
-- =============================================================================

USE elearning_db;

-- Thêm cột URL ảnh đại diện, đặt sau cột status
ALTER TABLE users ADD COLUMN avatar_url TEXT NULL AFTER status;
