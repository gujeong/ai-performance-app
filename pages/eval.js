import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { getRecords, updateRecord } from '../lib/db'
import Layout from '../components/Layout'
import Head from 'next/head'

export default function Eval() {
  const { user, email, loading, isCeo } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState([])
  const [tab, setTab] = useState('pending')
  const [scores, setScores] = useState({})
  const [feedbacks, setFeedbacks] = useState({})
  const [saving, setSaving] = useState({})

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login')
      else if (!isCeo) router.replace('/')
    }
  }, [loading, user, isCeo])

  useEffect(() => {
    if (!isCeo) return
    getRecords().then(setRecords)
  }, [isCeo])

  async function submitEval(rec) {
    const score = scores[rec.id]
    if (!score) { alert('점수를 선택해주세요'); return }
    setSaving(p => ({ ...p, [rec.id]: true }))
    await updateRecord(rec.id, { score, feedback: feedbacks[rec.id] || '' })
    setRecords(prev => prev.map(r => r.id === rec.id ? { ...r, score, feedback: feedbacks[rec.id] || '' } : r))
    setSaving(p => ({ ...p, [rec.id]: false }))
  }

  if (loading || !user || !isCeo) return null

  const pending = records.filter(r => !r.score || r.score === 0)
  const done = records.filter(r => r.score > 0)
  const shown = tab === 'pending' ? pending : done

  return (
    <>
      <Head><title>대표 평가 · AI 성과 관리</title></Head>
      <Layout title="대표 평가">
        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['pending', `평가 대기 ${pending.length}`], ['done', `완료 ${done.length}`]].map(([k, label]) => (
            <button
              key={k}
              className="btn btn-ghost"
              style={{ flex: 1, fontWeight: tab === k ? 700 : 400, borderColor: tab === k ? 'var(--accent)' : undefined, color: tab === k ? 'var(--accent)' : undefined }}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {shown.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
            {tab === 'pending' ? '평가 대기 실적이 없습니다 ✓' : '완료된 평가가 없습니다'}
          </div>
        )}

        {shown.map(r => {
          const u = r.users || {}
          return (
            <div key={r.id} className="card" style={{ marginBottom: 14, opacity: saving[r.id] ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.task}</div>
                <span className="tool-tag">{r.tool}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                {u.name || r.user_name} · {u.team || r.user_team} · {r.date}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 4 }}>AI 활용 내용</div>
                  <div style={{ fontSize: 13 }}>{r.content}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 4 }}>활용 효과</div>
                  <div style={{ fontSize: 13 }}>{r.effect}</div>
                </div>
              </div>

              {tab === 'pending' ? (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>점수 평가</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setScores(p => ({ ...p, [r.id]: n }))}
                        style={{
                          flex: 1, padding: '10px 0', border: '1.5px solid',
                          borderColor: (scores[r.id] || 0) >= n ? '#f0c040' : 'var(--border)',
                          borderRadius: 8, background: (scores[r.id] || 0) >= n ? '#fdf6e3' : 'var(--surface)',
                          fontSize: 18, cursor: 'pointer', transition: 'all 0.1s'
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {scores[r.id] && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textAlign: 'center' }}>
                      {['', '미흡', '보통', '양호', '우수', '탁월'][scores[r.id]]}
                    </div>
                  )}
                  <textarea
                    placeholder="피드백 (선택)"
                    style={{ minHeight: 64, marginBottom: 10 }}
                    value={feedbacks[r.id] || ''}
                    onChange={e => setFeedbacks(p => ({ ...p, [r.id]: e.target.value }))}
                  />
                  <button className="btn btn-primary btn-block" onClick={() => submitEval(r)} disabled={saving[r.id]}>
                    {saving[r.id] ? '저장 중...' : '평가 저장'}
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f0c040', fontSize: 18 }}>{'★'.repeat(r.score)}</span>
                  {r.feedback && <span style={{ fontSize: 13, color: 'var(--text2)', flex: 1, marginLeft: 12 }}>{r.feedback}</span>}
                </div>
              )}
            </div>
          )
        })}
      </Layout>
    </>
  )
}
