import { supabase } from './supabase'
import { normalizeSupabaseUrl } from './supabaseConfig'
import { isMissingDeletedAtColumn } from './recordFilters'

export function getSupabaseProjectRef() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match?.[1] || url || '(설정 없음)'
}

export async function checkSoftDeleteReady() {
  const projectRef = getSupabaseProjectRef()
  const { error } = await supabase.from('records').select('deleted_at').limit(1)

  if (!error) {
    return { ready: true, projectRef }
  }
  if (isMissingDeletedAtColumn(error)) {
    return { ready: false, projectRef, error: error.message }
  }
  return { ready: true, projectRef, warning: error.message }
}
