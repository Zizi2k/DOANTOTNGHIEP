/**
 * Che giấu thông tin cá nhân (PII) khi trả API cho học viên.
 * Admin và giáo viên được xem đầy đủ; học viên khác chỉ thấy thông tin công khai.
 */
function canViewMemberPII(viewer) {
  return viewer && (viewer.role === 'admin' || viewer.role === 'teacher');
}

/** Chuyển thông tin thành viên sang dạng công khai nếu viewer không có quyền PII */
function toPublicMember(member, viewer) {
  if (canViewMemberPII(viewer)) return member;
  return {
    id: member.id,
    fullname: member.fullname,
    role: member.role,
    avatar_url: member.avatar_url || null,
  };
}

/** Áp dụng toPublicMember cho danh sách thành viên */
function mapPublicMembers(members, viewer) {
  return members.map((m) => toPublicMember(m, viewer));
}

/** Loại bỏ username, code, phone, zalo khỏi bản ghi học viên */
function toPublicStudentRecord(record, viewer) {
  if (canViewMemberPII(viewer)) return record;
  const { username, code, phone, zalo, ...rest } = record;
  return rest;
}

function mapPublicStudentRecords(records, viewer) {
  return records.map((r) => toPublicStudentRecord(r, viewer));
}

/** Loại bỏ username khỏi bản ghi vinh danh */
function toPublicHonorEntry(entry, viewer) {
  if (canViewMemberPII(viewer)) return entry;
  const { username, ...rest } = entry;
  return rest;
}

function mapPublicHonorEntries(entries, viewer) {
  return entries.map((e) => toPublicHonorEntry(e, viewer));
}

module.exports = {
  canViewMemberPII,
  toPublicMember,
  mapPublicMembers,
  toPublicStudentRecord,
  mapPublicStudentRecords,
  toPublicHonorEntry,
  mapPublicHonorEntries,
};
