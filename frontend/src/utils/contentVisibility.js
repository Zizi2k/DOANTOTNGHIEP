// Hiển thị và gửi trạng thái ẩn/hẹn giờ mở nội dung bài học, bài tập, quiz

/** Badge trạng thái: đang ẩn, hẹn mở, hoặc đang hiển thị */
export function getContentVisibilityStatus(item) {
  if (!item) return { label: '—', variant: 'secondary' };
  if (Number(item.is_hidden) === 1 || item.is_hidden === true) {
    return { label: 'Đang ẩn', variant: 'secondary' };
  }
  if (item.visible_from && new Date(item.visible_from) > new Date()) {
    return {
      label: `Mở ${new Date(item.visible_from).toLocaleString('vi-VN')}`,
      variant: 'warning',
    };
  }
  return { label: 'Đang hiển thị', variant: 'success' };
}

/** Chuyển ISO datetime sang giá trị input datetime-local */
export function toDatetimeLocalValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Thêm visible_from và is_hidden vào FormData hoặc object JSON */
export function appendVisibilityFields(target, form) {
  const visibleFrom = form.visible_from || '';
  const isHidden = form.is_hidden ? '1' : '0';
  if (typeof FormData !== 'undefined' && target instanceof FormData) {
    target.append('visible_from', visibleFrom);
    target.append('is_hidden', isHidden);
    return;
  }
  target.visible_from = visibleFrom || null;
  target.is_hidden = isHidden;
}
