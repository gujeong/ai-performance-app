import { assertRecordAttachmentAccess } from '../../../lib/attachmentAccess'
import { ATTACHMENT_BUCKET } from '../../../lib/attachmentConfig'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id, email } = req.query
    if (!id || !email) {
      return res.status(400).json({ error: 'id, email이 필요합니다.' })
    }

    const admin = getSupabaseAdmin()
    const { data: attachment, error } = await admin
      .from('record_attachments')
      .select('id, record_id, file_name, storage_path')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!attachment) {
      return res.status(404).json({ error: '첨부파일을 찾을 수 없습니다.' })
    }

    await assertRecordAttachmentAccess(email, attachment.record_id)

    const { data: signed, error: signError } = await admin.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(attachment.storage_path, 120)

    if (signError) throw signError

    return res.redirect(302, signed.signedUrl)
  } catch (err) {
    console.error('attachment download error:', err)
    const status = err.status || 500
    return res.status(status).json({ error: err.message || '다운로드 실패' })
  }
}
