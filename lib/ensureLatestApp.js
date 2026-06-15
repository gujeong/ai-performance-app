const VERSION_KEY = 'ai_perf_app_build_id'

export function getAppBuildId() {
  return process.env.NEXT_PUBLIC_BUILD_ID || 'dev'
}

/** 배포 버전이 바뀌면 구버전 캐시(PWA·브라우저)를 끊고 최신 페이지로 이동 */
export function ensureLatestApp() {
  if (typeof window === 'undefined') return

  const buildId = getAppBuildId()

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister())
    })
  }

  const stored = localStorage.getItem(VERSION_KEY)
  if (stored && stored !== buildId) {
    localStorage.setItem(VERSION_KEY, buildId)
    if ('caches' in window) {
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    }
    const url = new URL(window.location.href)
    url.searchParams.set('_v', buildId.slice(0, 8))
    window.location.replace(url.toString())
    return
  }

  if (!stored) {
    localStorage.setItem(VERSION_KEY, buildId)
  }
}
