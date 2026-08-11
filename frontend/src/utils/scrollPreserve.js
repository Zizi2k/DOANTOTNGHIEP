// Giữ vị trí scroll khi refetch / cập nhật DOM không đổi route

export function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

/** Khôi phục scroll sau khi layout ổn định (double rAF) */
export function restoreScrollY(y) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    });
  });
}

/** Bọc thao tác async: giữ scroll trước/sau khi fn chạy */
export async function preserveScrollDuring(fn) {
  const y = getScrollY();
  try {
    return await fn();
  } finally {
    restoreScrollY(y);
  }
}
