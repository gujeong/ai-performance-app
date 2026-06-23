import { createClient } from '@supabase/supabase-js'
import { normalizeSupabaseUrl } from './supabaseConfig'

let adminClient = null

export function getSupabaseAdmin() {
  if (adminClient) return adminClient

  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.')
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return adminClient
}
