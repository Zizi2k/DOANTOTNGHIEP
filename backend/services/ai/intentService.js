/*
 * intentService.js
 * Nhận diện mục đích câu hỏi của người dùng
 * trong Trợ lý AI Huỳnh Gia.
 */

const INTENTS = {
  COURSE_CONSULTING: 'COURSE_CONSULTING',
  MY_SCHEDULE: 'MY_SCHEDULE',
  MY_ATTENDANCE: 'MY_ATTENDANCE',
  MY_ASSIGNMENTS: 'MY_ASSIGNMENTS',
  MY_TUITION: 'MY_TUITION',
  GENERAL_QA: 'GENERAL_QA',
};

/**
 * Chuẩn hóa văn bản tiếng Việt.
 * Chuyển về chữ thường để việc so khớp từ khóa ổn định hơn.
 */
const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .trim();
};

/**
 * Kiểm tra câu hỏi có chứa ít nhất một từ khóa.
 */
const containsAny = (text, keywords) => {
  return keywords.some((keyword) => text.includes(keyword));
};

/**
 * Xác định intent của câu hỏi.
 */
const detectIntent = (message) => {
  const text = normalizeText(message);

  // ==============================
  // 1. HỌC PHÍ / CÔNG NỢ
  // ==============================
  if (
    containsAny(text, [
      'học phí',
      'hoc phi',
      'công nợ',
      'cong no',
      'còn nợ',
      'con no',
      'đóng tiền',
      'dong tien',
      'biên lai',
      'bien lai',
    ])
  ) {
    return INTENTS.MY_TUITION;
  }

  // ==============================
  // 2. LỊCH HỌC
  // ==============================
  if (
    containsAny(text, [
      'lịch học',
      'lich hoc',
      'lịch của tôi',
      'học lúc mấy giờ',
      'hoc luc may gio',
      'học ngày',
      'hoc ngay',
      'học hôm nay',
      'học ngày mai',
    ])
  ) {
    return INTENTS.MY_SCHEDULE;
  }

  // ==============================
  // 3. ĐIỂM DANH
  // ==============================
  if (
    containsAny(text, [
      'điểm danh',
      'diem danh',
      'vắng',
      'vang',
      'nghỉ học',
      'nghi hoc',
      'có mặt',
      'co mat',
    ])
  ) {
    return INTENTS.MY_ATTENDANCE;
  }

  // ==============================
  // 4. BÀI TẬP
  // ==============================
  if (
    containsAny(text, [
      'bài tập',
      'bai tap',
      'nộp bài',
      'nop bai',
      'hạn nộp',
      'han nop',
      'deadline',
      'bài chưa làm',
      'bai chua lam',
    ])
  ) {
    return INTENTS.MY_ASSIGNMENTS;
  }

  // ==============================
  // 5. TƯ VẤN KHÓA HỌC
  // ==============================
  if (
    containsAny(text, [
      'khóa học',
      'khoa hoc',
      'tư vấn',
      'tu van',
      'nên học',
      'nen hoc',
      'muốn học',
      'muon hoc',
      'đăng ký học',
      'dang ky hoc',
      'excel',
      'word',
      'tiếng anh',
      'tieng anh',
      'tin học',
      'tin hoc',
    ])
  ) {
    return INTENTS.COURSE_CONSULTING;
  }

  // Không thuộc các nhóm trên
  return INTENTS.GENERAL_QA;
};

module.exports = {
  INTENTS,
  detectIntent,
};