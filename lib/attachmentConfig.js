export const ATTACHMENT_BUCKET = 'record-attachments'

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_ATTACHMENTS_PER_RECORD = 5

export const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'zip', 'hwp',
])

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
])

export function formatFileSize(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function getFileExtension(name) {
  const parts = (name || '').split('.')
  if (parts.length < 2) return ''
  return parts.pop().toLowerCase()
}

export function isAllowedAttachment(fileName, mimeType, sizeBytes) {
  const ext = getFileExtension(fileName)
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) {
    return { ok: false, reason: '허용되지 않는 파일 형식입니다.' }
  }
  if (mimeType && !ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType) && mimeType !== 'application/octet-stream') {
    // hwp 등 브라우저가 octet-stream으로 보내는 경우 허용
    if (ext !== 'hwp') {
      return { ok: false, reason: '허용되지 않는 파일 형식입니다.' }
    }
  }
  if (sizeBytes > MAX_ATTACHMENT_SIZE) {
    return { ok: false, reason: `파일 크기는 ${formatFileSize(MAX_ATTACHMENT_SIZE)} 이하여야 합니다.` }
  }
  return { ok: true }
}
