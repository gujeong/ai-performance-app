import { useRef } from 'react'
import {
  formatFileSize,
  MAX_ATTACHMENTS_PER_RECORD,
  MAX_ATTACHMENT_SIZE,
  validatePendingFiles,
} from '../lib/attachments'

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip,.hwp'

export default function AttachmentUpload({
  files,
  onChange,
  existingCount = 0,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const remaining = MAX_ATTACHMENTS_PER_RECORD - existingCount - files.length

  function addFiles(fileList) {
    const next = [...files]
    for (const file of fileList) {
      if (next.length + existingCount >= MAX_ATTACHMENTS_PER_RECORD) break
      next.push(file)
    }
    const err = validatePendingFiles(next, existingCount)
    if (err) {
      alert(err)
      return
    }
    onChange(next)
  }

  function removeAt(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="form-group">
      <label>
        첨부파일 <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 12 }}>(선택, 본인·평가자만 열람)</span>
      </label>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
        PDF·이미지·문서 등 최대 {MAX_ATTACHMENTS_PER_RECORD}개, 파일당 {formatFileSize(MAX_ATTACHMENT_SIZE)}
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
              }}
            >
              <i className="ti ti-file" style={{ color: 'var(--text3)' }} />
              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatFileSize(file.size)}</span>
              {!disabled && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '4px 8px', fontSize: 12 }}
                  onClick={() => removeAt(i)}
                >
                  제거
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        style={{ display: 'none' }}
        disabled={disabled || remaining <= 0}
        onChange={(e) => {
          if (e.target.files?.length) addFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
      <button
        type="button"
        className="btn btn-ghost"
        disabled={disabled || remaining <= 0}
        onClick={() => inputRef.current?.click()}
      >
        <i className="ti ti-upload" /> 파일 선택 ({remaining}개 추가 가능)
      </button>
    </div>
  )
}
