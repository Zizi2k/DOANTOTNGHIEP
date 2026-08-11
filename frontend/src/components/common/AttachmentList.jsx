{/* AttachmentList.jsx — Danh sách file đính kèm chỉ xem (không chỉnh sửa) */}
import ContentAttachmentPreview from './ContentAttachmentPreview';
import { getItemAttachments } from '../../utils/attachmentHelpers';

/** props: item — bài học/thảo luận có attachments hoặc file_url */
export default function AttachmentList({
  item,
  apiBase,
  defaultExpanded = false,
  compact = false,
}) {
  const attachments = getItemAttachments(item);
  if (!attachments.length) return null;

  return (
    <div className="attachment-list">
      {attachments.map((attachment, idx) => (
        <div key={attachment.id ?? `${attachment.file_url}-${idx}`} className="attachment-list-item">
          <ContentAttachmentPreview
            item={attachment}
            apiBase={apiBase}
            title={attachment.original_name || item?.title || `Tài liệu ${idx + 1}`}
            defaultExpanded={defaultExpanded && attachments.length === 1}
            compact={compact}
          />
        </div>
      ))}
    </div>
  );
}
