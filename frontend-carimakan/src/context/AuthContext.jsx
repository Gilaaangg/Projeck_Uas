import { createContext, useState, useEffect } from 'react'
import api from '../api/axios'

// eslint-disable-next-line react-refresh/only-export-components -- context + provider kept together intentionally
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Saat pertama load, cek apakah sudah ada token tersimpan
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('cm_token')
      const savedUser = localStorage.getItem('cm_user')

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          // Verifikasi token masih valid ke backend
          const res = await api.get('/auth/profile')
          setUser(res.data.data.user)
        } catch {
          localStorage.removeItem('cm_token')
          localStorage.removeItem('cm_user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user: loggedUser, token } = res.data.data

    localStorage.setItem('cm_token', token)
    localStorage.setItem('cm_user', JSON.stringify(loggedUser))
    setUser(loggedUser)

    return loggedUser
  }

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData)
    const { user: newUser, token } = res.data.data

    localStorage.setItem('cm_token', token)
    localStorage.setItem('cm_user', JSON.stringify(newUser))
    setUser(newUser)

    return newUser
  }

  const logout = () => {
    localStorage.removeItem('cm_token')
    localStorage.removeItem('cm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
