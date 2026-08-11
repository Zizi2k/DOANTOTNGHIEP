/**
 * Thao tác thông báo in-app (notifications).
 * CRUD cơ bản: tạo, liệt kê, đếm chưa đọc, đánh dấu đã đọc.
 */
const pool = require('../config/db');

/** Tạo thông báo mới cho user */
async function createNotification(conn, {
  userId, type, title, body, classId, linkPath, sentBy, zaloStatus, zaloError,
}) {
  const db = conn || pool;
  const [result] = await db.query(
    `INSERT INTO notifications
      (user_id, type, title, body, class_id, link_path, sent_by, zalo_status, zalo_error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, type, title, body, classId || null, linkPath || null,
      sentBy || null, zaloStatus || null, zaloError || null,
    ],
  );
  return result.insertId;
}

/** Lấy thông báo chưa đọc của user */
async function getUnreadForUser(userId, limit = 20) {
  const [rows] = await pool.query(
    `SELECT n.*, c.name AS class_name
     FROM notifications n
     LEFT JOIN classes c ON n.class_id = c.id
     WHERE n.user_id = ? AND n.is_read = 0
     ORDER BY n.created_at DESC
     LIMIT ?`,
    [userId, limit],
  );
  return rows;
}

/** Đếm số thông báo chưa đọc */
async function getUnreadCount(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId],
  );
  return rows[0]?.cnt || 0;
}

/** Liệt kê thông báo có phân trang */
async function listForUser(userId, { limit = 30, offset = 0 } = {}) {
  const [rows] = await pool.query(
    `SELECT n.*, c.name AS class_name
     FROM notifications n
     LEFT JOIN classes c ON n.class_id = c.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );
  return rows;
}

/** Đánh dấu một thông báo đã đọc */
async function markRead(userId, notificationId) {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
    [notificationId, userId],
  );
  return result.affectedRows > 0;
}

/** Đánh dấu tất cả thông báo đã đọc */
async function markAllRead(userId) {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
    [userId],
  );
  return result.affectedRows;
}

module.exports = {
  createNotification,
  getUnreadForUser,
  getUnreadCount,
  listForUser,
  markRead,
  markAllRead,
};
