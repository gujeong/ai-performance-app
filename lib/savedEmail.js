const EMAIL_KEY = 'ai_perf_saved_email'
const REMEMBER_KEY = 'ai_perf_remember_email'

export function loadSavedEmailPrefs() {
  if (typeof window === 'undefined') return { email: '', remember: false }
  const remember = localStorage.getItem(REMEMBER_KEY) === '1'
  const email = remember ? (localStorage.getItem(EMAIL_KEY) || '') : ''
  return { email, remember }
}

export function persistSavedEmail(email, remember) {
  if (typeof window === 'undefined') return false
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1')
      localStorage.setItem(EMAIL_KEY, email.trim())
    } else {
      localStorage.setItem(REMEMBER_KEY, '0')
      localStorage.removeItem(EMAIL_KEY)
    }
    return true
  } catch {
    return false
  }
}
