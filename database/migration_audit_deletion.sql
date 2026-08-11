-- =============================================================================
-- migration_audit_deletion.sql
-- Mục đích: Tạo module nhật ký thao tác (audit_log) và yêu cầu xóa chờ admin
--           duyệt (deletion_requests) để kiểm soát thay đổi và xóa dữ liệu.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Bảng audit_log: Nhật ký hành động của người dùng trên hệ thống
-- action: create, update, delete, delete_request, approve, reject
-- metadata: JSON lưu chi tiết bổ sung (dữ liệu cũ/mới...)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  actor_id INT NOT NULL,                                -- FK → users (người thực hiện)
  action ENUM('create', 'update', 'delete', 'delete_request', 'approve', 'reject') NOT NULL,
  resource_type VARCHAR(50) NOT NULL,                   -- Loại tài nguyên (user, class...)
  resource_id INT NULL,                                 -- ID tài nguyên bị tác động
  resource_label VARCHAR(255) NULL,                     -- Nhãn hiển thị tài nguyên
  metadata JSON NULL,                                   -- Dữ liệu bổ sung dạng JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_audit_actor (actor_id),                     -- Index: tra cứu theo người thực hiện
  INDEX idx_audit_resource (resource_type, resource_id), -- Index: tra cứu theo tài nguyên
  INDEX idx_audit_created (created_at),                 -- Index: sắp xếp theo thời gian
  INDEX idx_audit_action (action)                       -- Index: lọc theo loại hành động
);

-- -----------------------------------------------------------------------------
-- Bảng deletion_requests: Yêu cầu xóa dữ liệu chờ admin phê duyệt
-- status: pending=chờ duyệt, approved=đã duyệt, rejected=từ chối, cancelled=hủy
-- executed_at: Thời điểm thực thi xóa sau khi được duyệt
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deletion_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,                    -- Khóa chính
  requested_by INT NOT NULL,                            -- FK → users (người yêu cầu xóa)
  resource_type VARCHAR(50) NOT NULL,                   -- Loại tài nguyên cần xóa
  resource_id INT NOT NULL,                             -- ID tài nguyên cần xóa
  resource_label VARCHAR(255) NULL,                     -- Nhãn hiển thị
  reason TEXT,                                          -- Lý do xóa
  metadata JSON NULL,                                   -- Dữ liệu bổ sung
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  reviewed_by INT NULL,                                 -- FK → users (admin duyệt)
  reviewed_at TIMESTAMP NULL,                           -- Thời điểm duyệt/từ chối
  review_note TEXT NULL,                                -- Ghi chú của admin
  executed_at TIMESTAMP NULL,                           -- Thời điểm thực thi xóa
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_deletion_status (status),                   -- Index: lọc theo trạng thái
  INDEX idx_deletion_requester (requested_by),          -- Index: tra cứu theo người yêu cầu
  INDEX idx_deletion_resource (resource_type, resource_id) -- Index: tra cứu theo tài nguyên
);
