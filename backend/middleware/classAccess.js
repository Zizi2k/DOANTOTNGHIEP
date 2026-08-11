/*
 * classAccess.js — Kiểm tra quyền truy cập lớp học theo thành viên, giáo viên và phạm vi admin.
 * Cung cấp helper tra cứu class_id từ bài học/bài tập/quiz và middleware requireClass*.
 */
const pool = require('../config/db');
const { getUserScope, studentCodeMatchesScope } = require('../utils/adminScope');
const { teachingStaffRoleSql, isTeachingStaffUser } = require('../utils/teachingStaff');

// Kiểm tra user có trong bảng class_members hay không
async function isClassMember(userId, classId) {
  const [rows] = await pool.query(
    'SELECT id FROM class_members WHERE class_id = ? AND user_id = ?',
    [classId, userId]
  );
  return rows.length > 0;
}

// Giáo viên/nhân sự giảng dạy (không phải học viên) được phân công lớp
async function isClassTeacher(userId, classId) {
  const [rows] = await pool.query(
    `SELECT cm.id FROM class_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.class_id = ? AND cm.user_id = ? AND u.role != 'student'
       AND ${teachingStaffRoleSql('u')}`,
    [classId, userId]
  );
  return rows.length > 0;
}

// Admin phạm vi HG/EG chỉ thấy lớp có học viên thuộc mã trung tâm tương ứng
async function isClassInUserScope(classId, user) {
  const scope = getUserScope(user);
  if (!scope) return true;

  const [students] = await pool.query(
    `SELECT u.code FROM class_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.class_id = ? AND u.role = 'student'`,
    [classId]
  );
  const [profiles] = await pool.query(
    'SELECT student_code FROM tuition_profiles WHERE class_id = ?',
    [classId]
  );
  const codes = [
    ...students.map((s) => s.code),
    ...profiles.map((p) => p.student_code),
  ];
  if (codes.length === 0) return true;
  return codes.some((code) => studentCodeMatchesScope(code, scope));
}

// Quản lý lớp: admin toàn quyền hoặc giáo viên được phân công
async function canManageClass(user, classId) {
  if (!(await isClassInUserScope(classId, user))) return false;
  if (user.role === 'admin') return true;
  if (isTeachingStaffUser(user)) return isClassTeacher(user.id, classId);
  return false;
}

// Truy cập lớp: thành viên lớp hoặc admin
async function canAccessClass(user, classId) {
  if (!(await isClassInUserScope(classId, user))) return false;
  if (user.role === 'admin') return true;
  return isClassMember(user.id, classId);
}

// Trả về false và gửi response nếu không đủ quyền; manage=true yêu cầu quyền quản lý
async function assertClassAccess(user, classId, res, { manage = false } = {}) {
  if (!classId) {
    res.status(400).json({ message: 'Thiếu thông tin lớp học' });
    return false;
  }
  const allowed = manage
    ? await canManageClass(user, classId)
    : await canAccessClass(user, classId);
  if (!allowed) {
    res.status(403).json({
      message: manage
        ? 'Bạn không được phân công quản lý lớp học này'
        : 'Bạn không thuộc lớp học này',
    });
    return false;
  }
  return true;
}

// Helper lấy class_id từ các tài nguyên con (bài học, bài tập, nộp bài)
async function getLessonClassId(lessonId) {
  const [rows] = await pool.query('SELECT class_id FROM lessons WHERE id = ?', [lessonId]);
  return rows[0]?.class_id;
}

async function getAssignmentClassId(assignmentId) {
  const [rows] = await pool.query('SELECT class_id FROM assignments WHERE id = ?', [assignmentId]);
  return rows[0]?.class_id;
}

async function getQuizClassId(quizId) {
  const [rows] = await pool.query('SELECT class_id FROM quizzes WHERE id = ?', [quizId]);
  return rows[0]?.class_id;
}

async function getSubmissionClassId(submissionId) {
  const [rows] = await pool.query(
    `SELECT a.class_id FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     WHERE s.id = ?`,
    [submissionId]
  );
  return rows[0]?.class_id;
}

async function getQuizSubmissionClassId(submissionId) {
  const [rows] = await pool.query(
    `SELECT q.class_id FROM quiz_submissions qs
     JOIN quizzes q ON qs.quiz_id = q.id
     WHERE qs.id = ?`,
    [submissionId]
  );
  return rows[0]?.class_id;
}

// Middleware Express: yêu cầu là thành viên lớp (param mặc định :id)
const requireClassMember = (param = 'id') => async (req, res, next) => {
  try {
    const classId = req.params[param] || req.params.classId;
    if (!(await assertClassAccess(req.user, classId, res))) return;
    req.classId = classId;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
  }
};

// Middleware Express: yêu cầu quyền quản lý lớp (giáo viên phụ trách hoặc admin)
const requireClassTeacher = (param = 'id') => async (req, res, next) => {
  try {
    const classId = req.params[param] || req.params.classId;
    if (!(await assertClassAccess(req.user, classId, res, { manage: true }))) return;
    req.classId = classId;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
  }
};

module.exports = {
  isClassMember,
  isClassTeacher,
  isClassInUserScope,
  canManageClass,
  canAccessClass,
  assertClassAccess,
  getLessonClassId,
  getAssignmentClassId,
  getQuizClassId,
  getSubmissionClassId,
  getQuizSubmissionClassId,
  requireClassMember,
  requireClassTeacher,
};
