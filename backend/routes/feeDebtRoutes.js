/*
 * feeDebtRoutes.js — Route công nợ học phí/sách của học viên đã nghỉ học.
 * Prefix mount: /api/fee-debts
 */
const express = require('express');
const { listFeeDebts, deleteFeeDebt } = require('../controllers/feeDebtController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('admin'), listFeeDebts);
router.delete('/:id', authorize('admin'), deleteFeeDebt);

module.exports = router;
