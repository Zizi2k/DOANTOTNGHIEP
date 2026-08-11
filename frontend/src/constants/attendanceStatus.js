// Hằng số nhãn hiển thị trạng thái điểm danh
export const ATTENDANCE_STATUS_LABELS = {
  present: 'Có mặt',
  absent: 'Vắng',
  late: 'Đi muộn',
  excused: 'Có phép',
  dropped: 'Nghỉ luôn',
};

/** Trả về nhãn tiếng Việt cho mã trạng thái điểm danh */
export function getAttendanceStatusLabel(status) {
  return ATTENDANCE_STATUS_LABELS[status] || status;
}
