/*
 * userRoutes.js — Quản lý người dùng: admin, giáo viên, CRUD tài khoản và hồ sơ.
 * Prefix mount: /api/users
 */
const express = require('express');
const {
  listAdmins,
  listTeachers,
  getUsers,
  getUserProfile,
  updateManagedProfile,
  createUser,
  updateUser,
  deleteUser,
  uploadUserAvatar,
} = require('../controllers/userController');
const { authenticate, authorize, requireSuperAdmin } = require('../middleware/auth');
const { uploadMemory } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

// Đường dẫn tĩnh trước param động để tránh nhầm :id
router.get('/admins', authorize('admin'), requireSuperAdmin, listAdmins);
router.get('/teachers', authorize('admin'), listTeachers);

// Trang cá nhân — mọi user đã đăng nhập
router.get('/:id/profile', getUserProfile);
// Admin / giáo viên sửa hồ sơ học viên (avatar + thông tin)
router.put(
  '/:id/profile',
  authorize('admin', 'teacher'),
  uploadMemory.single('avatar'),
  updateManagedProfile,
);
router.post(
  '/:id/avatar',
  authorize('admin', 'teacher'),
  uploadMemory.single('avatar'),
  uploadUserAvatar,
);

// Các route CRUD user chỉ dành cho admin
router.use(authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
