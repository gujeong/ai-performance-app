import { assertRecordDeleteAccess } from '../../../lib/attachmentAccess'
import { ATTACHMENT_BUCKET } from '../../../lib/attachmentConfig'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { recordId, email } = req.body || {}
    if (!recordId || !email) {
      return res.status(400).json({ error: 'recordId, email이 필요합니다.' })
    }

    await assertRecordDeleteAccess(email, recordId)

    const admin = getSupabaseAdmin()
    const { data: attachments, error } = await admin
      .from('record_attachments')
      .select('storage_path')
      .eq('record_id', recordId)

    if (error) throw error

    if (attachments?.length) {
      const paths = attachments.map(a => a.storage_path)
      await admin.storage.from(ATTACHMENT_BUCKET).remove(paths)
      await admin.from('record_attachments').delete().eq('record_id', recordId)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('attachment cleanup error:', err)
    return res.status(500).json({ error: err.message || '첨부파일 정리 실패' })
  }
}
