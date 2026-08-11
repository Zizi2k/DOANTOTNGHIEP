/*
 * fileRoutes.js — Tải file bảo mật qua token (không cần đăng nhập nếu có token hợp lệ).
 * Prefix mount: /api/files
 */
const express = require('express');
const { downloadFile } = require('../controllers/fileController');

const router = express.Router();

router.get('/download/:token', downloadFile);

module.exports = router;
