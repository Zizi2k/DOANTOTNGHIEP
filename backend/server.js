/*
 * server.js — Điểm khởi động chính của API backend hệ thống quản lý học viên.
 * Cấu hình Express, middleware toàn cục, đăng ký các route API và khởi chạy server.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const quizRoutes = require('./routes/quizRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const onlineSessionRoutes = require('./routes/onlineSessionRoutes');
const tuitionRoutes = require('./routes/tuitionRoutes');
const studentRoutes = require('./routes/studentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const feeDebtRoutes = require('./routes/feeDebtRoutes');
const fileRoutes = require('./routes/fileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const promoRoutes = require('./routes/promoRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { ensureSchema } = require('./config/ensureSchema');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Cho phép CORS từ mọi origin, hỗ trợ header Authorization cho JWT
app.use(cors({
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Bỏ qua parse JSON khi request là multipart (upload file)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});

// Phục vụ file tĩnh đã upload (avatar, tài liệu, ...)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Đăng ký các nhóm route API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/online-sessions', onlineSessionRoutes);
app.use('/api/tuition', tuitionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/fee-debts', feeDebtRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promo', promoRoutes);
// Đăng ký route cho Trợ lý AI Huỳnh Gia
app.use('/api/ai', aiRoutes);

// Kiểm tra sức khỏe API (không cần DB)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API học trực tuyến đang hoạt động' });
});

// Kiểm tra kết nối cơ sở dữ liệu
app.get('/api/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'ERROR', db: 'failed', error: err.message });
  }
});

// Xử lý lỗi toàn cục: Multer (upload) và lỗi chung
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Tệp tin quá lớn (tối đa 50MB)' });
    }
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'Lỗi hệ thống' });
});

// Khởi động server và đồng bộ schema DB (migration nhẹ khi thiếu bảng/cột)
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  ensureSchema().catch((err) => {
    console.warn('Không thể kiểm tra schema DB:', err.message);
  });
});
