{/* ScrollRestoration.jsx — Lưu/khôi phục scroll theo route (back/forward) */}
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { getScrollY, restoreScrollY } from '../../utils/scrollPreserve';

const scrollPositions = new Map();

function scrollKey(pathname, search = '') {
  return `${pathname}${search}`;
}

/**
 * Ghi nhớ vị trí scroll từng route; khôi phục khi POP (nút back trình duyệt).
 */
export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevKeyRef = useRef(null);

  useEffect(() => {
    const key = scrollKey(location.pathname, location.search);
    const prevKey = prevKeyRef.current;

    if (prevKey && prevKey !== key) {
      scrollPositions.set(prevKey, getScrollY());
    }

    const saved = scrollPositions.get(key);
    if (saved != null && navigationType === 'POP') {
      restoreScrollY(saved);
    }

    prevKeyRef.current = key;
  }, [location.pathname, location.search, navigationType]);

  useEffect(() => {
    const key = scrollKey(location.pathname, location.search);
    let frame = null;

    const onScroll = () => {
      if (frame != null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scrollPositions.set(key, getScrollY());
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [location.pathname, location.search]);

  return null;
}
