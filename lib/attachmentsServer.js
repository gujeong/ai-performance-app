import { ATTACHMENT_BUCKET } from './attachmentConfig'
import { getSupabaseAdmin } from './supabaseAdmin'

export async function deleteAttachmentsForRecord(recordId) {
  const admin = getSupabaseAdmin()
  const { data: attachments, error } = await admin
    .from('record_attachments')
    .select('id, storage_path')
    .eq('record_id', recordId)

  if (error) throw error
  if (!attachments?.length) return

  const paths = attachments.map(a => a.storage_path)
  await admin.storage.from(ATTACHMENT_BUCKET).remove(paths)
  await admin.from('record_attachments').delete().eq('record_id', recordId)
}
