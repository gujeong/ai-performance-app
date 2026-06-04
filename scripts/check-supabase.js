const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function loadEnvLocal() {
  const file = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return {}
  const env = {}
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

function normalizeUrl(url) {
  return (url || '').trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() }
  const url = normalizeUrl(env.NEXT_PUBLIC_SUPABASE_URL)
  const key = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!url || !key) {
    console.error('❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY가 없습니다.')
    console.error('   docs/운영DB연결.md 를 참고해 Vercel과 동일한 값을 넣으세요.')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const users = await supabase.from('users').select('*', { count: 'exact', head: true })
  const records = await supabase.from('records').select('*', { count: 'exact', head: true })

  if (users.error) {
    console.error('❌ users 테이블 조회 실패:', users.error.message)
    process.exit(1)
  }

  const userCount = users.count ?? 0
  const recordCount = records.count ?? 0
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '?'

  console.log(`Supabase 프로젝트: ${ref}`)
  console.log(`등록 사용자: ${userCount}명`)
  console.log(`실적 건수: ${recordCount}건`)

  if (userCount === 0) {
    console.warn('')
    console.warn('⚠️  사용자가 0명입니다. 운영 DB가 아닐 수 있습니다.')
    console.warn('    Vercel → Settings → Environment Variables 값과 .env.local 이 같은지 확인하세요.')
    console.warn('    docs/운영DB연결.md')
    process.exit(2)
  }

  console.log('')
  console.log('✅ 운영 DB로 보입니다. 로그인 테스트를 진행하세요.')
}

main().catch((err) => {
  console.error('❌', err.message)
  process.exit(1)
})
