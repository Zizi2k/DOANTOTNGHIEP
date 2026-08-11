{/* StatCard.jsx — Thẻ thống kê số liệu trên dashboard và trang tổng quan */}

/** props: icon, tone, label, value, hint — một chỉ số KPI */
export function StatCard({ icon, tone = 'blue', label, value, hint }) {
  return (
    <div className="module-stat-card">
      <div className={`module-stat-icon tone-${tone}`}>
        <i className={`bi bi-${icon}`} />
      </div>
      <div className="module-stat-body">
        <div className="module-stat-label">{label}</div>
        <div className="module-stat-value">{value}</div>
        {hint && <div className="module-stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

/** Lưới chứa nhiều StatCard */
export function StatCardGrid({ children, className = '' }) {
  return (
    <div className={`module-stat-grid ${className}`.trim()}>
      {children}
    </div>
  );
}
