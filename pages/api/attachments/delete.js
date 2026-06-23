import { assertRecordAttachmentManage } from '../../../lib/attachmentAccess'
import { ATTACHMENT_BUCKET } from '../../../lib/attachmentConfig'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
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
      .select('id, record_id, storage_path')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!attachment) {
      return res.status(404).json({ error: '첨부파일을 찾을 수 없습니다.' })
    }

    await assertRecordAttachmentManage(email, attachment.record_id)

    await admin.storage.from(ATTACHMENT_BUCKET).remove([attachment.storage_path])
    const { error: deleteError } = await admin
      .from('record_attachments')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('attachment delete error:', err)
    const status = err.status || 500
    return res.status(status).json({ error: err.message || '삭제 실패' })
  }
}
