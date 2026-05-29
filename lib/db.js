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

export async function getRecordById(id) {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateRecord(id, updates) {
  const { error } = await supabase.from('records').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteRecord(id) {
  const { error } = await supabase.from('records').delete().eq('id', id)
  if (error) throw error
}

/* ---- 피드백 대화 ---- */
export async function getCommentsByRecordIds(recordIds) {
  if (!recordIds || recordIds.length === 0) return []
  const { data, error } = await supabase
    .from('record_comments')
    .select('*')
    .in('record_id', recordIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addRecordComment(comment) {
  const payload = {
    record_id: comment.record_id,
    author_email: comment.author_email,
    author_name: comment.author_name || null,
    author_role: comment.author_role,
    message: comment.message,
  }

  const { data, error } = await supabase
    .from('record_comments')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}
