import { normalizeEmail } from './email'

/** 코드에 고정된 admin (환경 변수 없이도 적용) */
const BUILTIN_ADMIN_EMAILS = ['gujeong@hjcustoms.co.kr']

export function getAdminEmails() {
  const fromEnv = [
    process.env.NEXT_PUBLIC_CEO_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAILS,
  ]
    .filter(Boolean)
    .join(',')

  const emails = [...BUILTIN_ADMIN_EMAILS, ...fromEnv.split(',')]
    .map(normalizeEmail)
    .filter(Boolean)

  return new Set(emails)
}

export function isAdminUser(user, email) {
  if (!user || !email) return false

  const em = normalizeEmail(email)
  if (getAdminEmails().has(em)) return true
  if (user.is_ceo === true) return true

  const roleText = (user.role || '').toLowerCase().trim()
  return roleText.includes('대표') || roleText.includes('ceo') || roleText.includes('admin')
}
