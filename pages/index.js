import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { getMyRecords, getRecords } from '../lib/db'
import Layout from '../components/Layout'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  const { user, email, loading, logout, isCeo } = useAuth()
  const router = useRouter()
  const [myRecs, setMyRecs] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user])

  useEffect(() => {
    if (!email) return
    getMyRecords(email).then(setMyRecs)
    getRecords().then(recs => {
      setTotalCount(recs.length)
      setPendingCount(recs.filter(r => !r.score).length)
    })
  }, [email])

  if (loading || !user) return null

  const scored = myRecs.filter(r => r.score > 0)
  const myAvg = scored.length ? (scored.reduce((a, r) => a + r.score, 0) / scored.length).toFixed(1) : '-'

  return (
    <>
      <Head><title>홈 · AI 성과 관리</title></Head>
      <Layout
        title="AI 성과 관리"
        dark
        rightAction={
          <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:'13px',color:'#cfdbff',border:'1px solid rgba(117, 140, 217, 0.5)',background:'rgba(15, 24, 55, 0.55)'}} onClick={logout}>
            로그아웃
          </button>
        }
      >
        <div className={styles.page}>
          {/* AI 히어로 */}
          <section className={styles.hero}>
            <div className={styles.heroLabel}>AI Performance Assistant</div>
            <div className={styles.heroTop}>
              <div>
                <div className={styles.heroName}>{user.name}님의 AI 실적 허브</div>
                <div className={styles.heroMeta}>{user.dept} · {user.team} · {user.role}</div>
              </div>
              <div className={styles.pulse} />
            </div>
            <div className={styles.heroInsight}>
              {pendingCount > 0
                ? `현재 평가 대기 ${pendingCount}건이 있습니다. 우선순위 기반으로 검토해보세요.`
                : '평가 대기 항목이 없습니다. 다음 실적 등록으로 생산성 지표를 높여보세요.'}
            </div>
          </section>

          {/* 내 현황 */}
          <div className={styles.statGrid}>
            <div className={styles.stat}>
              <div className={styles.statVal}>{myRecs.length}</div>
              <div className={styles.statLabel}>내 실적</div>
            </div>
            <div className={`${styles.stat} ${styles.statStrong}`}>
              <div className={styles.statVal}>{myAvg}</div>
              <div className={styles.statLabel}>평균 점수</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{totalCount}</div>
              <div className={styles.statLabel}>전사 실적</div>
            </div>
          </div>

          {/* 대표 알림 */}
          {isCeo && pendingCount > 0 && (
            <div className={`alert alert-info ${styles.ceoAlert}`} onClick={() => router.push('/eval')}>
              <i className="ti ti-bell" />
              평가 대기 실적 <strong>{pendingCount}건</strong> · 평가하러 가기 →
            </div>
          )}

          {/* AI 액션 */}
          <div className={styles.quickGrid}>
            <button className={styles.quickBtn} onClick={() => router.push('/register')}>
              <i className={`ti ti-plus ${styles.quickIcon}`} style={{ color: '#7de8ff' }} />
              <div className={styles.quickTitle}>AI 실적 초안 작성</div>
              <div className={styles.quickDesc}>핵심 업무를 빠르게 정리해 등록</div>
            </button>
            <button className={styles.quickBtn} onClick={() => router.push('/ranking')}>
              <i className={`ti ti-trophy ${styles.quickIcon}`} style={{ color: '#f8d978' }} />
              <div className={styles.quickTitle}>AI 인사이트 랭킹</div>
              <div className={styles.quickDesc}>전사 성과 흐름과 순위 확인</div>
            </button>
          </div>

          {/* 최근 나의 실적 */}
          <div className={styles.listCard}>
            <div className={styles.listTitle}>최근 나의 실적</div>
            {myRecs.length === 0 ? (
              <div className={styles.empty}>
                아직 등록된 실적이 없어요<br />
                <span className={styles.link} onClick={() => router.push('/register')}>첫 실적을 등록해보세요 →</span>
              </div>
            ) : myRecs.slice(0, 3).map(r => (
              <div key={r.id} className={styles.row}>
                <div className={styles.rowTop}>
                  <div className={styles.task}>{r.task}</div>
                  <span className={`tool-tag ${styles.darkToolTag}`}>{r.tool}</span>
                </div>
                <div className={styles.rowBottom}>
                  {r.score > 0
                    ? <span className={styles.score}>{'★'.repeat(r.score)}</span>
                    : <span className={`badge badge-gray ${styles.darkBadgeGray}`}>평가 대기</span>
                  }
                  {r.feedback && <span className={styles.feedback}>{r.feedback}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  )
}
