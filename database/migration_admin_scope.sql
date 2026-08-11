-- =============================================================================
-- migration_admin_scope.sql
-- Mục đích: Phân quyền admin theo phạm vi mã học viên (tiền tố HG / EG).
-- Giá trị admin_scope:
--   all hoặc NULL = admin tối cao (quản lý cả LHG và EGC)
--   HG          = admin LHG (chỉ quản lý học viên mã HG...)
--   EG          = admin EGC (chỉ quản lý học viên mã EG...)
-- =============================================================================

-- Thêm cột phạm vi quản trị cho tài khoản admin
ALTER TABLE users ADD COLUMN admin_scope ENUM('all', 'HG', 'EG') NULL DEFAULT NULL;

-- Gán quyền admin tối cao cho các admin hiện có chưa có phạm vi
UPDATE users SET admin_scope = 'all' WHERE role = 'admin' AND admin_scope IS NULL;
