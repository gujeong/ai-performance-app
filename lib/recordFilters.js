const MISSING_COLUMN = /deleted_at|schema cache|could not find the/i

export function isMissingDeletedAtColumn(error) {
  if (!error) return false
  const msg = [error.message, error.details, error.hint, error.code].filter(Boolean).join(' ')
  return MISSING_COLUMN.test(msg)
}

export function deletedAtSetupError() {
  return new Error(
    'DB에 삭제함 컬럼(deleted_at)이 없습니다.\n\n' +
    'Supabase → SQL Editor에서 아래 2줄을 실행한 뒤 다시 시도하세요:\n\n' +
    'alter table records add column if not exists deleted_at timestamptz;\n' +
    'alter table records add column if not exists deleted_by text;'
  )
}

export function throwIfMissingDeletedAt(error) {
  if (isMissingDeletedAtColumn(error)) throw deletedAtSetupError()
  throw error
}

export function isActiveRecord(record) {
  return record?.deleted_at == null
}

export function filterActiveRecords(records) {
  return (records || []).filter(isActiveRecord)
}

export function filterDeletedRecords(records) {
  return (records || []).filter(r => r?.deleted_at != null)
}
