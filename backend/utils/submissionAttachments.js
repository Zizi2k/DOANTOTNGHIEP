/**
 * Quản lý tệp đính kèm bài nộp (assignment/quiz).
 * Hỗ trợ nhiều file, fallback cột legacy file_url, và migration dữ liệu cũ.
 */
const pool = require('../config/db');
const { syncLegacyColumns } = require('./contentAttachments');

/** Lấy map submission_id → danh sách đính kèm theo loại bài nộp */
async function fetchSubmissionAttachmentsMap(submissionType, submissionIds) {
  if (!submissionIds.length) return new Map();
  const placeholders = submissionIds.map(() => '?').join(',');
  let rows;
  try {
    [rows] = await pool.query(
      `SELECT id, submission_type, submission_id, sort_order, file_url, file_type, original_name, created_at
       FROM submission_attachments
       WHERE submission_type = ? AND submission_id IN (${placeholders})
       ORDER BY sort_order ASC, id ASC`,
      [submissionType, ...submissionIds],
    );
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') return new Map();
    throw err;
  }
  const map = new Map();
  for (const row of rows) {
    const key = row.submission_id;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      id: row.id,
      file_url: row.file_url,
      file_type: row.file_type,
      original_name: row.original_name,
      created_at: row.created_at,
    });
  }
  return map;
}

/** Chuyển cột file_url cũ thành mảng đính kèm (tương thích ngược) */
function legacyAttachmentsFromRow(row, urlField = 'file_url') {
  const fileUrl = row[urlField] ?? row.file_url;
  if (!fileUrl) return [];
  return [{
    id: null,
    file_url: fileUrl,
    file_type: row.file_type ?? null,
    original_name: null,
  }];
}

/** Gắn danh sách đính kèm vào từng dòng kết quả truy vấn */
function attachSubmissionAttachmentsToRows(rows, submissionType, attachmentMap) {
  return rows.map((row) => {
    const fromTable = attachmentMap.get(row.id) || [];
    const attachments = fromTable.length
      ? fromTable
      : legacyAttachmentsFromRow(row);
    return { ...row, attachments };
  });
}

/** Gắn đính kèm bài nộp (tự truy vấn DB) */
async function attachSubmissionAttachmentsToRowsAsync(rows, submissionType) {
  if (!rows.length) return rows;
  const map = await fetchSubmissionAttachmentsMap(
    submissionType,
    rows.map((r) => r.id).filter(Boolean),
  );
  return attachSubmissionAttachmentsToRows(rows, submissionType, map);
}

/** Bổ sung submission_attachments cho các dòng có submission_id riêng */
async function enrichRowsWithSubmissionAttachments(
  rows,
  submissionType,
  { idField = 'submission_id', urlField = 'submission_url' } = {},
) {
  const ids = rows.map((r) => r[idField]).filter(Boolean);
  const map = await fetchSubmissionAttachmentsMap(submissionType, ids);
  return rows.map((row) => {
    const submissionId = row[idField];
    let submission_attachments = [];
    if (submissionId) {
      submission_attachments = map.get(submissionId) || [];
      if (!submission_attachments.length && row[urlField]) {
        submission_attachments = [{
          id: null,
          file_url: row[urlField],
          file_type: null,
          original_name: null,
        }];
      }
    }
    return { ...row, submission_attachments };
  });
}

/** Thay thế toàn bộ đính kèm của một bài nộp */
async function replaceSubmissionAttachments(conn, submissionType, submissionId, attachments) {
  await conn.query(
    'DELETE FROM submission_attachments WHERE submission_type = ? AND submission_id = ?',
    [submissionType, submissionId],
  );
  for (let i = 0; i < attachments.length; i += 1) {
    const item = attachments[i];
    await conn.query(
      `INSERT INTO submission_attachments
        (submission_type, submission_id, sort_order, file_url, file_type, original_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        submissionType,
        submissionId,
        i,
        item.file_url,
        item.file_type ?? null,
        item.original_name ?? null,
      ],
    );
  }
}

/** Xóa bài nộp kèm tất cả đính kèm */
async function deleteSubmissionWithAttachments(conn, submissionType, submissionId) {
  await conn.query(
    'DELETE FROM submission_attachments WHERE submission_type = ? AND submission_id = ?',
    [submissionType, submissionId],
  );
  const table = submissionType === 'assignment' ? 'submissions' : 'quiz_submissions';
  const [result] = await conn.query(`DELETE FROM ${table} WHERE id = ?`, [submissionId]);
  return result.affectedRows > 0;
}

/** Migration: chuyển file_url cũ sang bảng submission_attachments (chạy một lần) */
async function migrateLegacySubmissionAttachments() {
  const [[flag]] = await pool.query(
    "SELECT meta_value FROM app_meta WHERE meta_key = 'submission_attachments_migrated_v1'",
  ).catch(() => [[null]]);

  if (flag?.meta_value === 'done') return;

  const pairs = [
    { type: 'assignment', table: 'submissions' },
    { type: 'quiz', table: 'quiz_submissions' },
  ];

  for (const { type, table } of pairs) {
    const [rows] = await pool.query(
      `SELECT id, file_url, file_type FROM ${table} WHERE file_url IS NOT NULL AND file_url != ''`,
    );
    for (const row of rows) {
      const [existing] = await pool.query(
        'SELECT id FROM submission_attachments WHERE submission_type = ? AND submission_id = ? LIMIT 1',
        [type, row.id],
      ).catch(() => [[]]);
      if (existing.length) continue;
      await pool.query(
        `INSERT INTO submission_attachments
          (submission_type, submission_id, sort_order, file_url, file_type)
         VALUES (?, ?, 0, ?, ?)`,
        [type, row.id, row.file_url, row.file_type],
      ).catch(() => {});
    }
  }

  await pool.query(
    `INSERT INTO app_meta (meta_key, meta_value) VALUES ('submission_attachments_migrated_v1', 'done')
     ON DUPLICATE KEY UPDATE meta_value = 'done'`,
  ).catch(() => {});
}

module.exports = {
  syncLegacyColumns,
  fetchSubmissionAttachmentsMap,
  attachSubmissionAttachmentsToRows,
  attachSubmissionAttachmentsToRowsAsync,
  enrichRowsWithSubmissionAttachments,
  replaceSubmissionAttachments,
  deleteSubmissionWithAttachments,
  migrateLegacySubmissionAttachments,
};
