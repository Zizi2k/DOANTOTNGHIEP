-- =============================================================================
-- migration_class_subject.sql
-- Mục đích: Thêm cột subject (môn học) vào bảng classes để phân loại lớp
--           theo: chinese (Trung), english (Anh), computer (Tin), vietnamese (Việt).
-- =============================================================================

USE elearning_db;

-- Thêm cột môn học, đặt sau description; NULL = chưa phân loại
ALTER TABLE classes
  ADD COLUMN subject ENUM('chinese', 'english', 'computer', 'vietnamese') NULL AFTER description;
