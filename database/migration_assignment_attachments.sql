-- =============================================================================
-- migration_assignment_attachments.sql
-- Mục đích: Thêm cột đính kèm file đề bài vào bảng assignments
--           (file_url, file_type) để giáo viên upload tài liệu kèm bài tập.
-- =============================================================================

USE elearning_db;

-- Cột đường dẫn file đề bài đính kèm
ALTER TABLE assignments ADD COLUMN file_url TEXT NULL AFTER description;
-- Cột loại file (pdf, docx, zip...)
ALTER TABLE assignments ADD COLUMN file_type VARCHAR(50) NULL AFTER file_url;
