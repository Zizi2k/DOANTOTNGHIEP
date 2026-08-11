/*
 * profilePath.js — Tạo đường dẫn route tới trang hồ sơ người dùng.
 */

/** Trả về `/profile/:id` hoặc null nếu thiếu id */
export function profilePath(userId) {
  if (userId == null || userId === '') return null;
  return `/profile/${userId}`;
}
