// Hook phân biệt lần tải đầu (spinner) và tải lại (overlay) để giữ vị trí scroll
import { useRef } from 'react';

/**
 * @param {boolean} isLoading — đang gọi API / tải dữ liệu
 * @returns {{ showInitialSpinner, showOverlay }} — kiểu hiển thị loading phù hợp
 */
export function useSoftLoading(isLoading) {
  const hasLoadedOnce = useRef(false);
  if (!isLoading) {
    hasLoadedOnce.current = true;
  }
  return {
    showInitialSpinner: isLoading && !hasLoadedOnce.current,
    showOverlay: isLoading && hasLoadedOnce.current,
  };
}
