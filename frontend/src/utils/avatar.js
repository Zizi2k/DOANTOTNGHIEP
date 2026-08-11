// Tiện ích avatar — chữ cái viết tắt tên và URL ảnh đại diện đầy đủ
import { API_BASE } from '../config/apiBase';

/** Lấy 1–2 chữ cái đầu từ họ tên để hiển thị khi không có ảnh */
export function getInitials(fullname) {
  if (!fullname) return '?';
  const parts = fullname.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Ghép đường dẫn tương đối upload với API_BASE; giữ nguyên blob/http */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('blob:') || avatarUrl.startsWith('http')) return avatarUrl;
  return `${API_BASE}${avatarUrl}`;
}
