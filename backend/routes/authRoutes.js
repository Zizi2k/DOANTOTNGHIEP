/*
 * authRoutes.js — Route xác thực: đăng nhập, đăng xuất, đăng ký, hồ sơ cá nhân.
 * Prefix mount: /api/auth
 */
const express = require('express');
const { login, logout, register, getMe, updateProfile } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadMemory } = require('../middleware/upload');

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/register', authenticate, authorize('admin'), register);
router.get('/me', authenticate, getMe);
// Cập nhật profile có thể kèm avatar qua multipart
router.put('/profile', authenticate, (req, res, next) => {
  uploadMemory.single('avatar')(req, res, (err) => {
    if (err) return next(err);
    updateProfile(req, res);
  });
});

module.exports = router;
