{/* LoadingOverlay.jsx — Lớp spinner phủ lên nội dung khi loading */}
import { Spinner } from 'react-bootstrap';

/** props: loading, children, className, minHeight */
export default function LoadingOverlay({
  loading,
  children,
  className = '',
  minHeight = 160,
}) {
  return (
    <div
      className={`loading-overlay-host ${className}`.trim()}
      style={{ minHeight: loading && !children ? minHeight : undefined }}
    >
      {children}
      {loading && (
        <div className="loading-overlay" aria-busy="true" aria-live="polite">
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </div>
  );
}
