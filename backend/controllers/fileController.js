/**
 * Controller tệp tin (File)
 * Phục vụ tải/xem tệp đã lưu trong DB theo token công khai (file_assets).
 */
const pool = require('../config/db');

/**
 * GET /files/:token — Tải hoặc xem inline tệp theo token.
 * @param {string} req.params.token - Token duy nhất của file_assets
 * @returns {200} binary stream với Content-Disposition inline
 */
const downloadFile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT original_name, mime_type, data FROM file_assets WHERE token = ?',
      [req.params.token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tệp' });
    }

    const file = rows[0];
    const safeName = String(file.original_name || 'file').replace(/[^\w.\-() ]/g, '_');
    res.set('Content-Type', file.mime_type || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${encodeURIComponent(safeName)}"`);
    res.send(file.data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
  }
};

module.exports = { downloadFile };
