// Phạm vi quản trị HG/EG — xác định admin có giới hạn theo mã trung tâm hay admin tối cao

/** Lấy scope HG hoặc EG từ user (admin/giáo viên); null nếu không áp dụng */
export function getUserScope(user) {
  if (!user) return null;
  if (user.role !== 'admin' && user.role !== 'teacher') return null;

  const scope = user.admin_scope;
  if (scope === 'HG' || scope === 'EG') return scope;

  if (user.role === 'admin') return null;

  if (user.code) {
    const c = String(user.code).trim().toUpperCase();
    if (c.startsWith('EG')) return 'EG';
    if (c.startsWith('HG')) return 'HG';
  }
  return null;
}

export function getAdminScope(user) {
  return getUserScope(user);
}

/** Admin không bị giới hạn scope HG/EG */
export function isSuperAdmin(user) {
  return user?.role === 'admin' && getUserScope(user) === null;
}

/** Admin thuộc một trung tâm HG hoặc EG */
export function isScopedAdmin(user) {
  return user?.role === 'admin' && getUserScope(user) !== null;
}

export function isScopedUser(user) {
  return getUserScope(user) !== null;
}

/** Nhãn hiển thị scope trên giao diện */
export function scopeLabel(scope) {
  if (scope === 'HG') return 'LHG (HG)';
  if (scope === 'EG') return 'EGC (EG)';
  return 'Admin tối cao';
}

/** Tiền tố mã bắt buộc khi tạo tài khoản trong scope */
export function lockedCodePrefix(user) {
  return getUserScope(user) || '';
}
