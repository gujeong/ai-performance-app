import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { getRecords, updateRecord } from '../lib/db'
import Layout from '../components/Layout'
import Head from 'next/head'

export default function List() {
  const { user, email, loading } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('all')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user])

  useEffect(() => {
    if (!email) return
    getRecords().then(r => { setRecords(r); setFetching(false) })
  }, [email])

  async function toggleLike(rec) {
    const liked = (rec.liked_by || []).includes(email)
    const newLikedBy = liked ? rec.liked_by.filter(e => e !== email) : [...(rec.liked_by || []), email]
    const newLikes = liked ? Math.max(0, (rec.likes || 0) - 1) : (rec.likes || 0) + 1
    await updateRecord(rec.id, { likes: newLikes, liked_by: newLikedBy })
    setRecords(prev => prev.map(r => r.id === rec.id ? { ...r, likes: newLikes, liked_by: newLikedBy } : r))
  }

  if (loading || !user) return null
  const shown = filter === 'mine' ? records.filter(r => r.email === email) : records

  return (
    <>
      <Head><title>실적 조회 · AI 성과 관리</title></Head>
      <Layout title="실적 조회">
        {/* 필터 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['all', 'mine'].map(f => (
            <button
              key={f}
              className={`btn btn-ghost`}
              style={{ flex: 1, fontWeight: filter === f ? 700 : 400, borderColor: filter === f ? 'var(--accent)' : undefined, color: filter === f ? 'var(--accent)' : undefined }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '전체 실적' : '내 실적'}
            </button>
          ))}
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>불러오는 중...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
            등록된 실적이 없습니다
          </div>
        ) : shown.map(r => {
          const u = r.users || {}
          const liked = (r.liked_by || []).includes(email)
          return (
            <div key={r.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15, flex: 1, lineHeight: 1.4 }}>{r.task}</div>
                <span className="tool-tag">{r.tool}</span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                {u.name || r.user_name} · {u.team || r.user_team} · {r.date}
              </div>

              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text3)', fontSize: 11 }}>활용 내용</span><br />
                {r.content}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: 'var(--text3)', fontSize: 11 }}>효과</span><br />
                {r.effect}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div>
                  {r.score > 0
                    ? <span style={{ color: '#f0c040', fontSize: 15 }}>{'★'.repeat(r.score)}<span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 4 }}>{r.score}점</span></span>
                    : <span className="badge badge-gray">평가 대기</span>
                  }
                </div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: liked ? '#e74c3c' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                  onClick={() => toggleLike(r)}
                >
                  <i className={`ti ti-heart${liked ? '' : ''}`} style={{ fontSize: 18 }} />
                  {r.likes || 0}
                </button>
              </div>

              {r.feedback && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--accent-light)', borderRadius: 8, fontSize: 13, color: 'var(--accent-text)' }}>
                  <i className="ti ti-message-circle" /> {r.feedback}
                </div>
              )}
            </div>
          )
        })}
      </Layout>
    </>
  )
}
