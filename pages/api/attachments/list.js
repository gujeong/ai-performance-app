import { assertRecordAttachmentAccess } from '../../../lib/attachmentAccess'
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

    await assertRecordAttachmentAccess(email, recordId)

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('record_attachments')
      .select('id, record_id, file_name, mime_type, size_bytes, created_at')
      .eq('record_id', recordId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return res.status(200).json({ attachments: data || [] })
  } catch (err) {
    console.error('attachment list error:', err)
    const status = err.status || 500
    return res.status(status).json({ error: err.message || '목록 조회 실패' })
  }
}
