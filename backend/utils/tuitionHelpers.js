/**
 * Tiện ích học phí: parse môn/số tiền, tính giảm giá, công nợ, định dạng hiển thị.
 */
const SUBJECTS = {
  chinese: 'Tiếng Trung',
  english: 'Tiếng Anh',
  computer: 'Tin học',
  vietnamese: 'Tiếng Việt',
};

const SUBJECT_ALIASES = {
  'tieng trung': 'chinese',
  'tieng anh': 'english',
  'tin hoc': 'computer',
  'tieng viet': 'vietnamese',
  chinese: 'chinese',
  english: 'english',
  computer: 'computer',
  vietnamese: 'vietnamese',
};

/** Chuẩn hóa chuỗi: bỏ dấu, lowercase, gom khoảng trắng */
function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ');
}

/** Parse tên môn học từ chuỗi tiếng Việt hoặc key tiếng Anh */
function parseSubject(value) {
  const key = normalizeHeader(value);
  return SUBJECT_ALIASES[key] || null;
}

/** Parse số tiền từ chuỗi (loại bỏ ký tự không phải số) */
function parseAmount(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

/** Tính học phí sau giảm từ mức giảm phần trăm hoặc số tiền cố định */
function calculateFeeAfterDiscount(feeBefore, discount) {
  const before = parseAmount(feeBefore);
  if (!discount) return before;

  const value = Number(discount.discount_value) || 0;
  if (discount.discount_type === 'percent') {
    const pct = Math.min(Math.max(value, 0), 100);
    return Math.max(0, Math.round(before - (before * pct) / 100));
  }
  return Math.max(0, before - value);
}

/** Tra DB lấy discount rồi tính học phí sau giảm */
async function resolveFeeAfterWithDiscount(conn, feeBefore, discountId) {
  if (!discountId) return parseAmount(feeBefore);
  const [rows] = await conn.query(
    'SELECT discount_type, discount_value FROM fee_discounts WHERE id = ? AND is_active = TRUE',
    [discountId]
  );
  if (!rows.length) return parseAmount(feeBefore);
  return calculateFeeAfterDiscount(feeBefore, rows[0]);
}

/** Xác định feeBefore/feeAfter khi tạo/cập nhật hồ sơ học phí */
async function resolveTuitionAmounts(conn, {
  fee_before_discount, fee_after_discount, discount_id,
}) {
  const feeBefore = parseAmount(fee_before_discount);
  if (discount_id) {
    const feeAfter = await resolveFeeAfterWithDiscount(conn, feeBefore, discount_id);
    return { feeBefore, feeAfter };
  }
  return {
    feeBefore,
    feeAfter: parseAmount(fee_after_discount ?? fee_before_discount),
  };
}

/**
 * Tính công nợ học phí và phí sách từ lịch sử thanh toán.
 * Loại 'both' ưu tiên trừ học phí trước, phần còn lại vào phí sách.
 */
function computeDebt(profile, payments = []) {
  const feeAfter = Number(profile.fee_after_discount) || 0;
  const bookFee = Number(profile.book_fee) || 0;

  let tuitionPaid = 0;
  let bookPaid = 0;

  payments.forEach((p) => {
    const amt = Number(p.amount) || 0;
    if (p.payment_type === 'tuition') {
      tuitionPaid += amt;
    } else if (p.payment_type === 'book') {
      bookPaid += amt;
    } else if (p.payment_type === 'both') {
      const tuitionRemaining = Math.max(0, feeAfter - tuitionPaid);
      const toTuition = Math.min(amt, tuitionRemaining);
      tuitionPaid += toTuition;
      bookPaid += amt - toTuition;
    }
  });
  const tuitionDebt = Math.max(0, feeAfter - tuitionPaid);
  const bookDebt = Math.max(0, bookFee - bookPaid);
  const totalDebt = tuitionDebt + bookDebt;
  const totalDue = feeAfter + bookFee;
  const totalPaid = tuitionPaid + bookPaid;

  let status = 'unpaid';
  if (totalDue > 0 && totalPaid >= totalDue) status = 'paid';
  else if (totalPaid > 0) status = 'partial';

  return {
    tuition_paid: tuitionPaid,
    book_paid: bookPaid,
    total_paid: totalPaid,
    tuition_debt: tuitionDebt,
    book_debt: bookDebt,
    total_debt: totalDebt,
    status,
  };
}

/** Bổ sung thông tin công nợ và helper monthPaid vào hồ sơ học phí */
function enrichProfile(profile, payments = []) {
  const debt = computeDebt(profile, payments);
  const monthPayments = (month) => payments.filter((p) => p.period_month === month);

  return {
    ...profile,
    subject_label: SUBJECTS[profile.subject] || profile.subject,
    discount_name: profile.discount_name || null,
    ...debt,
    _payments: payments,
    monthPaid: (month) => {
      const mp = monthPayments(month);
      const feeAfter = Number(profile.fee_after_discount) || 0;
      let tuition = 0;
      let book = 0;
      mp.forEach((p) => {
        const amt = Number(p.amount) || 0;
        if (p.payment_type === 'tuition') tuition += amt;
        else if (p.payment_type === 'book') book += amt;
        else if (p.payment_type === 'both') {
          const tuitionRemaining = Math.max(0, feeAfter - tuition);
          const toTuition = Math.min(amt, tuitionRemaining);
          tuition += toTuition;
          book += amt - toTuition;
        }
      });
      const total = mp.reduce((s, p) => s + Number(p.amount), 0);
      return { tuition, book, total };
    },
  };
}

function formatMonthYear(month) {
  const [year, mon] = String(month).split('-');
  return `Tháng ${parseInt(mon, 10)}/${year}`;
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('vi-VN');
}

module.exports = {
  SUBJECTS,
  SUBJECT_ALIASES,
  normalizeHeader,
  parseSubject,
  parseAmount,
  calculateFeeAfterDiscount,
  resolveFeeAfterWithDiscount,
  resolveTuitionAmounts,
  computeDebt,
  enrichProfile,
  formatMonthYear,
  formatMoney,
};
