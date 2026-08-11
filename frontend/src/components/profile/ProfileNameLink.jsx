{/* ProfileNameLink.jsx — Link tên người dùng dẫn tới trang profile */}
import { Link } from 'react-router-dom';
import { profilePath } from '../../utils/profilePath';

/** props: userId, name, className — ẩn link nếu không có userId */
export default function ProfileNameLink({
  userId,
  children,
  className = 'profile-name-link',
}) {
  const to = profilePath(userId);
  if (!to) {
    return <span className={className}>{children}</span>;
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
