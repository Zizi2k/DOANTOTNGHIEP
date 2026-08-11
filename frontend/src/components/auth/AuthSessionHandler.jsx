{/* AuthSessionHandler.jsx — Lắng nghe hết phiên (401) và kiểm tra lại khi tab active */}
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';

/** Component vô hình: không render UI, chỉ xử lý sự kiện auth toàn cục */
export default function AuthSessionHandler() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const checkingRef = useRef(false);

  // Đăng ký auth:unauthorized và auth:check-session từ interceptor API
  useEffect(() => {
    const onUnauthorized = () => {
      logout();
      if (!window.location.pathname.startsWith('/login')) {
        navigate('/login', { replace: true });
      }
    };

    const onCheckSession = async () => {
      if (checkingRef.current) return;
      const token = localStorage.getItem('token');
      if (!token) {
        onUnauthorized();
        return;
      }

      checkingRef.current = true;
      try {
        const res = await authService.getMe();
        updateUser(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          onUnauthorized();
        }
      } finally {
        checkingRef.current = false;
      }
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    window.addEventListener('auth:check-session', onCheckSession);
    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized);
      window.removeEventListener('auth:check-session', onCheckSession);
    };
  }, [logout, navigate, updateUser]);

  // Khi quay lại tab: xác minh token còn hợp lệ
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!localStorage.getItem('token')) return;
      window.dispatchEvent(new CustomEvent('auth:check-session'));
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return null;
}
