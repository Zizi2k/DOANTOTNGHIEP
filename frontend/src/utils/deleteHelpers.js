// Thông báo kết quả xóa — phân biệt xóa ngay và gửi duyệt admin

/** Hiển thị alert nếu xóa cần duyệt; trả true khi đang chờ duyệt */
export function notifyDeleteResult(res) {
  if (res?.data?.pending_approval) {
    alert(res.data.message || 'Yêu cầu xóa đã gửi admin duyệt');
    return true;
  }
  return false;
}
