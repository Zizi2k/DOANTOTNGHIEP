/*
 * contextService.js
 * Truy xuất dữ liệu nghiệp vụ thật từ MySQL
 * để cung cấp context cho Trợ lý AI Huỳnh Gia.
 */

const pool = require('../../config/db');

/**
 * Chuẩn hóa văn bản để tìm kiếm.
 */
const normalize = (value = '') => {
  return String(value)
    .toLowerCase()
    .trim();
};

/**
 * Xác định nhánh HG / EG của học viên.
 *
 * HG = Huỳnh Gia
 * EG = English...
 *
 * Nếu không xác định được thì trả về null.
 */
const detectUserBranch = (user) => {
  const code = String(user?.code || '')
    .trim()
    .toUpperCase();

  if (code.startsWith('HG')) {
    return 'HG';
  }

  if (code.startsWith('EG')) {
    return 'EG';
  }

  return null;
};

/**
 * Lấy danh sách khóa học đang hoạt động.
 *
 * @param {Object} user Người dùng lấy từ JWT
 * @param {String} message Câu hỏi của người dùng
 */
const getCourseContext = async (user, message = '') => {
  const branch = detectUserBranch(user);

  let sql = `
    SELECT
      id,
      title,
      description,
      highlight,
      branch_scope,
      original_price,
      sale_price,
      discount_type,
      discount_value,
      registration_enabled,
      category,
      instructor_name,
      duration_label,
      level_label,
      rating,
      student_count,
      class_code
    FROM promo_courses
    WHERE is_active = 1
  `;

  const params = [];

  /*
   * Nếu xác định được nhánh của học viên
   * thì chỉ lấy khóa học thuộc nhánh đó.
   */
  if (branch) {
    sql += ` AND branch_scope = ?`;
    params.push(branch);
  }

  sql += `
    ORDER BY
      sort_order ASC,
      id DESC
  `;

  const [rows] = await pool.query(sql, params);

  /*
   * Nếu chưa có khóa học thì trả về mảng rỗng.
   */
  if (!rows.length) {
    return [];
  }

  const question = normalize(message);

  /*
   * Tìm các khóa có nội dung liên quan câu hỏi.
   *
   * Đây chỉ là bước lọc sơ bộ.
   * Gemini sẽ xử lý ngữ nghĩa tốt hơn ở bước sau.
   */
  const matched = rows.filter((course) => {
    const searchable = normalize([
      course.title,
      course.description,
      course.highlight,
      course.category,
      course.level_label,
      course.duration_label,
    ].filter(Boolean).join(' '));

    const importantWords = question
      .split(/\s+/)
      .filter((word) => word.length >= 3);

    return importantWords.some((word) =>
      searchable.includes(word)
    );
  });

  /*
   * Nếu tìm thấy khóa liên quan:
   * chỉ trả các khóa đó.
   *
   * Nếu chưa tìm thấy:
   * trả danh sách khóa đang hoạt động để AI
   * có dữ liệu tư vấn tổng quát.
   */
  const result = matched.length
    ? matched
    : rows;

  /*
   * Giới hạn context để tránh gửi quá nhiều dữ liệu
   * cho mô hình AI sau này.
   */
  return result.slice(0, 10);
};

module.exports = {
  getCourseContext,
};