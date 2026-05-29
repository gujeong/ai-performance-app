import { useState, createContext, useContext } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadUser(em) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', em)
      .single()
    if (data) {
      setEmail(em)
      setUser(data)
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
    return data
  }

  function logout() {
    setUser(null)
    setEmail(null)
  }

  const ceoEmail = (process.env.NEXT_PUBLIC_CEO_EMAIL || '').toLowerCase().trim()
  const roleText = (user?.role || '').toLowerCase().trim()
  const isCeoByRole = roleText.includes('대표') || roleText.includes('ceo')
  const isCeo = user?.is_ceo === true || isCeoByRole || (!!ceoEmail && !!email && email.toLowerCase().trim() === ceoEmail)

  return (
    <AuthContext.Provider value={{ user, email, loading, login, register, logout, isCeo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
