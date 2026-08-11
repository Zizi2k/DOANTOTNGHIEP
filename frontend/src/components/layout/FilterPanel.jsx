{/* FilterPanel.jsx — Panel bộ lọc dạng collapse với tiêu đề và nút hành động */}
/** props: title, children (các control lọc), actions */
export default function FilterPanel({ title = 'Bộ lọc tìm kiếm', children, actions }) {
  return (
    <div className="module-filter-panel">
      <div className="module-filter-panel-header">
        <i className="bi bi-funnel-fill" />
        <span>{title}</span>
      </div>
      <div className="module-filter-panel-body">{children}</div>
      {actions && <div className="module-filter-panel-actions">{actions}</div>}
    </div>
  );
}
