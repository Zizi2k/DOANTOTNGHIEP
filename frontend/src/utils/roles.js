// Phân quyền giáo viên / thành viên lớp trên giao diện
import { isScopedAdmin } from './adminScope';

/** Giáo viên hoặc admin có quyền dạy */
export function isTeachingStaffUser(user) {
  if (!user) return false;
  if (user.role === 'teacher') return true;
  return isScopedAdmin(user);
}

/** User có trong danh sách thành viên lớp và không phải học viên */
export function isClassTeachingMember(user, members) {
  if (!user || !members?.length) return false;
  return members.some((m) => m.id === user.id && m.role !== 'student');
}

/** Đủ điều kiện thao tác như GV trong lớp (chấm bài, điểm danh, v.v.) */
export function canActAsClassTeacher(user, members) {
  return isTeachingStaffUser(user) && isClassTeachingMember(user, members);
}

/** Badge vai trò hiển thị cạnh tên trong danh sách thành viên */
export function teachingStaffBadge(member) {
  if (member?.role === 'admin') return { bg: 'info', label: 'Admin / GV' };
  return { bg: 'primary', label: 'Giáo viên' };
}
