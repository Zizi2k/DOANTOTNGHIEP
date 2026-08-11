-- =============================================================================
-- migration_remove_centers.sql
-- Mục đích: Gỡ schema multi-center (LHG/EGC) sau khi revert code về mô hình
--           đơn trung tâm. Xóa dữ liệu EGC, bỏ cột center_id, drop bảng centers.
-- Chạy trên Railway MySQL Console hoặc: node backend/scripts/cleanup-centers.js
-- CẢNH BÁO: Thao tác xóa dữ liệu EGC không thể hoàn tác dễ dàng.
-- =============================================================================

-- Bước 1: Xóa dữ liệu gắn trung tâm EGC (nếu có)
-- Xóa thanh toán học phí thuộc hồ sơ EGC
DELETE tp FROM tuition_payments tp
INNER JOIN tuition_profiles p ON p.id = tp.profile_id
INNER JOIN centers c ON c.id = p.center_id
WHERE c.code = 'egc';

-- Xóa hồ sơ học phí EGC
DELETE FROM tuition_profiles
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Xóa mức giảm học phí EGC
DELETE FROM fee_discounts
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Xóa kỳ thu học phí EGC
DELETE FROM tuition_periods
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Xóa khóa đào tạo EGC
DELETE FROM training_courses
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Xóa nhật ký audit EGC
DELETE FROM audit_log
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Xóa yêu cầu xóa EGC
DELETE FROM deletion_requests
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Xóa lớp học EGC
DELETE FROM classes
WHERE center_id IN (SELECT id FROM centers WHERE code = 'egc');

-- Bước 2: Khôi phục unique index cũ (bỏ phần center_id)
-- Hồ sơ học phí: duy nhất theo (student_code, subject)
ALTER TABLE tuition_profiles DROP INDEX unique_center_student_subject;
ALTER TABLE tuition_profiles ADD UNIQUE KEY unique_student_subject (student_code, subject);

-- Kỳ thu học phí: duy nhất theo (period_month, subject)
ALTER TABLE tuition_periods DROP INDEX unique_center_period_subject;
ALTER TABLE tuition_periods ADD UNIQUE KEY unique_period_subject (period_month, subject);

-- Bước 3: Xóa cột center_id khỏi các bảng liên quan
ALTER TABLE classes DROP COLUMN center_id;
ALTER TABLE tuition_profiles DROP COLUMN center_id;
ALTER TABLE fee_discounts DROP COLUMN center_id;
ALTER TABLE training_courses DROP COLUMN center_id;
ALTER TABLE tuition_periods DROP COLUMN center_id;
ALTER TABLE audit_log DROP COLUMN center_id;
ALTER TABLE deletion_requests DROP COLUMN center_id;

-- Bước 4: Xóa bảng centers (trung tâm LHG/EGC)
DROP TABLE IF EXISTS centers;
