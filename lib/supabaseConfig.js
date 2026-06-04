export function normalizeSupabaseUrl(url) {
  return (url || '')
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '')
}

export function getSupabaseConfigError() {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const url = normalizeSupabaseUrl(rawUrl)
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!url || !key) {
    return 'Supabase 연결 정보가 설정되지 않았습니다. (.env.local 확인)'
  }
  if (url.includes('xxxx') || key === 'local-dev-placeholder-key') {
    return 'Supabase URL·키가 예시 값입니다. 실제 프로젝트 값으로 교체해 주세요.'
  }
  if (/\/rest\/v1/i.test(rawUrl)) {
    return 'Supabase URL에 /rest/v1 을 붙이지 마세요. Project URL만 넣어 주세요. (예: https://xxxx.supabase.co)'
  }
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('.supabase.co')) {
      return 'Supabase Project URL 형식이 아닙니다. (https://프로젝트ID.supabase.co)'
    }
  } catch {
    return 'Supabase URL 형식이 올바르지 않습니다.'
  }
  return null
}

export function withTimeout(promise, ms = 12000, message = '서버 응답 시간이 초과되었습니다.') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}
