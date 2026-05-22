import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)
const COOKIE_NAME = 'ai_perf_email'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

function setCookie(name, value) {
  if (typeof document === 'undefined') return
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = getCookie(COOKIE_NAME)
    if (saved) {
      loadUser(saved).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function loadUser(em) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', em)
      .single()
    if (data) {
      setEmail(em)
      setUser(data)
      setCookie(COOKIE_NAME, em)
    }
    return data
  }

  async function login(em) {
    return loadUser(em)
  }

  async function register(em, profile) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: em, ...profile }])
      .select()
      .single()
    if (error) throw error
    setEmail(em)
    setUser(data)
    setCookie(COOKIE_NAME, em)
    return data
  }

  function logout() {
    setUser(null)
    setEmail(null)
    deleteCookie(COOKIE_NAME)
  }

  return (
    <AuthContext.Provider value={{ user, email, loading, login, register, logout, isCeo: user?.is_ceo === true }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
