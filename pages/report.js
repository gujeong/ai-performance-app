import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { getRecords, getUsers } from '../lib/db'
import Layout from '../components/Layout'
import Head from 'next/head'

const GRADE = s => s >= 20 ? 'S' : s >= 15 ? 'A' : s >= 10 ? 'B' : s >= 5 ? 'C' : 'D'
const GRADE_COLOR = { S: '#0f6e56', A: '#1a6091', B: '#854f0b', C: '#6b6760', D: '#a32d2d' }

export default function Report() {
  const { user, loading, isCeo } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [records, setRecords] = useState([])
  const [selUser, setSelUser] = useState('all')
  const [period, setPeriod] = useState('2025')
  const [preview, setPreview] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login')
      else if (!isCeo) router.replace('/')
    }
  }, [loading, user, isCeo])

  useEffect(() => {
    if (!isCeo) return
    Promise.all([getUsers(), getRecords()]).then(([u, r]) => {
      setUsers(u.filter(x => !x.is_ceo))
      setRecords(r)
      setFetching(false)
    })
  }, [isCeo])

  function buildReport() {
    const targets = selUser === 'all' ? users : users.filter(u => u.email === selUser)
    return targets.map(u => {
      const recs = records.filter(r => r.email === u.email && r.score > 0)
      const total = recs.reduce((a, r) => a + r.score, 0)
      const avg = recs.length ? (total / recs.length).toFixed(1) : '-'
      const grade = GRADE(total)
      return { u, recs, total, avg, grade }
    })
  }

  if (loading || !user || !isCeo) return null

  const reportData = buildReport()

  return (
    <>
      <Head><title>인사고과 보고서 · AI 성과 관리</title></Head>
      <Layout title="인사고과 보고서">
        <div className="card">
          <div className="form-group">
            <label>직원 선택</label>
            <select value={selUser} onChange={e => setSelUser(e.target.value)}>
              <option value="all">전 직원</option>
              {users.map(u => <option key={u.email} value={u.email}>{u.name} ({u.team})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>기준 연도</label>
            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="2025">2025년</option>
              <option value="2026">2026년</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setPreview(true)}>
              <i className="ti ti-eye" /> 미리보기
            </button>
            <button className="btn btn-ghost" onClick={() => { setPreview(true); setTimeout(() => window.print(), 400) }}>
              <i className="ti ti-printer" /> 인쇄
            </button>
          </div>
        </div>

        {preview && (
          <div id="printable">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>AI 활용 성과 인사고과 보고서</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{period}년 · 출력일 {new Date().toLocaleDateString('ko-KR')}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                대표 확인<br /><br />___________
              </div>
            </div>

            {reportData.map(({ u, recs, total, avg, grade }) => (
              <div key={u.email} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--accent-text)', flexShrink: 0 }}>
                      {u.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.dept} · {u.team} · {u.role}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: GRADE_COLOR[grade] }}>{grade}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>종합 등급</div>
                  </div>
                </div>

                <div className="stat-grid" style={{ marginBottom: 14 }}>
                  <div className="stat"><div className="stat-val">{recs.length}</div><div className="stat-label">실적 건수</div></div>
                  <div className="stat"><div className="stat-val">{avg}</div><div className="stat-label">평균 점수</div></div>
                  <div className="stat"><div className="stat-val">{total}</div><div className="stat-label">누적 점수</div></div>
                </div>

                {recs.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface2)' }}>
                        {['업무명', '도구', '점수', '피드백'].map(h => (
                          <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recs.map(r => (
                        <tr key={r.id}>
                          <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>{r.task}</td>
                          <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}><span className="tool-tag">{r.tool}</span></td>
                          <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: '#f0c040' }}>{'★'.repeat(r.score)} {r.score}점</td>
                          <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>{r.feedback || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  )
}
