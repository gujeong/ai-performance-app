import { supabase } from './supabase'

/* ---- 유저 ---- */
export async function getUsers() {
  const { data } = await supabase.from('users').select('*').order('name')
  return data || []
}

/* ---- 실적 ---- */
export async function addRecord(record) {
  const { data, error } = await supabase
    .from('records')
    .insert([{ ...record, score: 0, feedback: '', likes: 0, liked_by: [] }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRecords() {
  const { data } = await supabase
    .from('records')
    .select('*, users(name, dept, team, role)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getMyRecords(email) {
  const { data } = await supabase
    .from('records')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateRecord(id, updates) {
  const { error } = await supabase.from('records').update(updates).eq('id', id)
  if (error) throw error
}
