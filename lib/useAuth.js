import { useState, createContext, useContext } from 'react'
import { supabase } from './supabase'
import { normalizeEmail } from './email'
import { isAdminUser } from './admin'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadUser(em) {
    const normalized = normalizeEmail(em)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', normalized)
      .maybeSingle()

    if (error) {
      const err = new Error(error.message || '사용자 조회에 실패했습니다.')
      err.code = error.code
      err.details = error.details
      throw err
    }
    if (data) {
      setEmail(normalizeEmail(data.email))
      setUser(data)
    }
    return data
  }

  async function login(em) {
    return loadUser(em)
  }

  async function register(em, profile) {
    const normalized = normalizeEmail(em)
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: normalized, ...profile }])
      .select()
      .single()
    if (error) throw error
    setEmail(normalized)
    setUser(data)
    return data
  }

  function logout() {
    setUser(null)
    setEmail(null)
  }

  const isCeo = isAdminUser(user, email)

  return (
    <AuthContext.Provider value={{ user, email, loading, login, register, logout, isCeo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
