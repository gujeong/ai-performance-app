import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { getRecords, getUsers } from '../lib/db'
import Layout from '../components/Layout'
import Head from 'next/head'

export default function Ranking() {
  const { user, email, loading } = useAuth()
  const router = useRouter()
  const [ranked, setRanked] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user])

  useEffect(() => {
    if (!email) return
    Promise.all([getRecords(), getUsers()]).then(([records, users]) => {
      const map = {}
      users.forEach(u => { map[u.email] = u })
      const scores = {}
      records.forEach(r => {
        if (!scores[r.email]) scores[r.email] = { total: 0, cnt: 0 }
        if (r.score > 0) { scores[r.email].total += r.score; scores[r.email].cnt++ }
      })
      const result = Object.entries(scores)
        .map(([em, s]) => ({ email: em, ...s, avg: s.cnt > 0 ? (s.total / s.cnt).toFixed(1) : 0, user: map[em] || {} }))
        .sort((a, b) => b.total - a.total)
      setRanked(result)
      setFetching(false)
    })
  }, [email])

  if (loading || !user) return null

  const medals = ['🥇', '🥈', '🥉']

  return (
    <>
      <Head><title>랭킹 보드 · AI 성과 관리</title></Head>
      <Layout title="랭킹 보드">
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>대표 평가 점수 기준 전사 순위</p>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>불러오는 중...</div>
        ) : ranked.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>아직 평가된 실적이 없습니다</div>
        ) : ranked.map((r, i) => (
          <div
            key={r.email}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', marginBottom: 10,
              background: r.email === email ? 'var(--accent-light)' : 'var(--surface)',
              border: r.email === email ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ fontSize: i < 3 ? 24 : 16, width: 32, textAlign: 'center', fontWeight: 700, color: 'var(--text3)' }}>
              {i < 3 ? medals[i] : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {r.user.name || r.email}
                {r.email === email && <span className="badge badge-green" style={{ marginLeft: 8 }}>나</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {r.user.dept} · {r.user.team} · {r.cnt}건 평가
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{r.total}점</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>평균 {r.avg}점</div>
            </div>
          </div>
        ))}
      </Layout>
    </>
  )
}
