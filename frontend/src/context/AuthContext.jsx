{/* AuthContext — Quản lý phiên đăng nhập: user, token, login/logout, đồng bộ localStorage */}
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

/** Provider bọc toàn app; props: children — cây component con */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên từ token khi mở app; xóa dữ liệu nếu token hết hạn (401)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe()
        .then((res) => setUser(res.data))
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /** Đăng nhập bằng username + mã; lưu token và user vào localStorage */
  const login = async (username, code) => {
    const res = await authService.login(username, code);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  /** Xóa token/user khỏi localStorage và state */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /** Cập nhật thông tin user sau chỉnh sửa profile */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook truy cập context auth từ component con */
export const useAuth = () => useContext(AuthContext);
