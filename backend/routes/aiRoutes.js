/*
 * aiRoutes.js
 * Route dành cho Trợ lý AI Huỳnh Gia
 * Prefix: /api/ai
 */

const express = require('express');

const { authenticate } = require('../middleware/auth');
const { chat } = require('../controllers/aiController');

const router = express.Router();

// Tất cả chức năng AI đều yêu cầu đăng nhập
router.use(authenticate);

// Gửi câu hỏi cho AI
router.post('/chat', chat);

module.exports = router;