/**
 * Xác định giáo viên/nhân sự giảng dạy và phạm vi chi nhánh HG/EG.
 * Admin chi nhánh và giáo viên được coi là teaching staff.
 */
const pool = require('../config/db');
const { getUserScope, studentCodeMatchesScope } = require('./adminScope');

/** Admin có phạm vi chi nhánh HG hoặc EG */
function isScopedBranchAdmin(user) {
  return user?.role === 'admin' && (user.admin_scope === 'HG' || user.admin_scope === 'EG');
}

/** Kiểm tra user có phải giáo viên hoặc admin chi nhánh */
function isTeachingStaffUser(user) {
  if (!user) return false;
  if (user.role === 'teacher') return true;
  return isScopedBranchAdmin(user);
}

/** Mệnh đề SQL lọc user là giáo viên hoặc admin chi nhánh */
function teachingStaffRoleSql(userAlias = 'u') {
  return `(${userAlias}.role = 'teacher' OR (${userAlias}.role = 'admin' AND ${userAlias}.admin_scope IN ('HG', 'EG')))`;
}

/** Xác định phạm vi chi nhánh của lớp dựa trên mã HV các thành viên */
async function getClassStudentScope(classId) {
  const [students] = await pool.query(
    `SELECT u.code FROM class_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.class_id = ? AND u.role = 'student'`,
    [classId]
  );
  const [profiles] = await pool.query(
    'SELECT student_code AS code FROM tuition_profiles WHERE class_id = ?',
    [classId]
  );
  const codes = [...students, ...profiles].map((r) => r.code).filter(Boolean);
  if (codes.length === 0) return null;

  const hasHG = codes.some((code) => studentCodeMatchesScope(code, 'HG'));
  const hasEG = codes.some((code) => studentCodeMatchesScope(code, 'EG'));
  if (hasHG && !hasEG) return 'HG';
  if (hasEG && !hasHG) return 'EG';
  return null;
}

/** Kiểm tra nhân sự có khớp phạm vi chi nhánh của lớp */
function teachingStaffMatchesScope(userRow, scope) {
  if (!scope) return true;
  if (userRow.role === 'admin') {
    return userRow.admin_scope === scope || userRow.admin_scope === 'all';
  }
  if (userRow.admin_scope === scope) return true;
  return studentCodeMatchesScope(userRow.code, scope);
}

/** Lọc danh sách nhân sự theo phạm vi chi nhánh */
function filterTeachingStaffByScope(rows, scope) {
  if (!scope) return rows;
  return rows.filter((row) => teachingStaffMatchesScope(row, scope));
}

/** Ưu tiên phạm vi lớp, fallback phạm vi user đang request */
function resolveTeachingStaffScope(classScope, requestUser) {
  return classScope || getUserScope(requestUser) || null;
}

module.exports = {
  isScopedBranchAdmin,
  isTeachingStaffUser,
  teachingStaffRoleSql,
  getClassStudentScope,
  teachingStaffMatchesScope,
  filterTeachingStaffByScope,
  resolveTeachingStaffScope,
};
