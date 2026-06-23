import { randomUUID } from 'crypto'
import { assertRecordAttachmentManage } from '../../../lib/attachmentAccess'
import { ATTACHMENT_BUCKET, isAllowedAttachment, MAX_ATTACHMENTS_PER_RECORD } from '../../../lib/attachmentConfig'
import { parseMultipart, readUploadedFile } from '../../../lib/parseMultipart'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export const config = {
  api: { bodyParser: false },
}

function sanitizeFileName(name) {
  return (name || 'file')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fields, file } = await parseMultipart(req)
    const recordId = fields.recordId
    const email = fields.email

    if (!recordId || !email || !file) {
      return res.status(400).json({ error: 'recordId, email, file이 필요합니다.' })
    }

    await assertRecordAttachmentManage(email, recordId)

    const admin = getSupabaseAdmin()
    const { count, error: countError } = await admin
      .from('record_attachments')
      .select('id', { count: 'exact', head: true })
      .eq('record_id', recordId)

    if (countError) throw countError
    if ((count || 0) >= MAX_ATTACHMENTS_PER_RECORD) {
      return res.status(400).json({ error: `첨부파일은 최대 ${MAX_ATTACHMENTS_PER_RECORD}개까지 등록할 수 있습니다.` })
    }

    const originalName = file.originalFilename || 'file'
    const mimeType = file.mimetype || 'application/octet-stream'
    const sizeBytes = file.size || 0

    const validation = isAllowedAttachment(originalName, mimeType, sizeBytes)
    if (!validation.ok) {
      return res.status(400).json({ error: validation.reason })
    }

    const attachmentId = randomUUID()
    const storagePath = `${recordId}/${attachmentId}_${sanitizeFileName(originalName)}`
    const buffer = await readUploadedFile(file)

    const { error: uploadError } = await admin.storage
      .from(ATTACHMENT_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data, error: insertError } = await admin
      .from('record_attachments')
      .insert([{
        id: attachmentId,
        record_id: recordId,
        owner_email: email,
        file_name: originalName,
        storage_path: storagePath,
        mime_type: mimeType,
        size_bytes: sizeBytes,
      }])
      .select()
      .single()

    if (insertError) {
      await admin.storage.from(ATTACHMENT_BUCKET).remove([storagePath]).catch(() => {})
      throw insertError
    }

    return res.status(200).json({ attachment: data })
  } catch (err) {
    console.error('attachment upload error:', err)
    const status = err.status || 500
    return res.status(status).json({ error: err.message || '업로드 실패' })
  }
}
