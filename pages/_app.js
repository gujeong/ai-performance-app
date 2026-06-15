import { useEffect } from 'react'
import '../styles/globals.css'
import { ensureLatestApp } from '../lib/ensureLatestApp'
import { AuthProvider } from '../lib/useAuth'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    ensureLatestApp()
  }, [])

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
