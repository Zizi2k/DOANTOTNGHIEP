// Cấu hình URL API — lấy từ biến môi trường Vite hoặc mặc định proxy /api
export const API_URL = import.meta.env.VITE_API_URL || '/api';
/** Gốc server (bỏ hậu tố /api) dùng cho link upload, avatar, v.v. */
export const API_BASE = API_URL.replace(/\/api\/?$/, '') || '';
