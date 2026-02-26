import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/services'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('medlog_token')
    const savedUser = localStorage.getItem('medlog_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('medlog_token')
        localStorage.removeItem('medlog_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const response = await authApi.login({ username, password })
    const { token, username: uname, role } = response.data

    const decoded = parseJwt(token)
    const userData = {
      id: decoded?.sub,
      username: uname,
      role: role,
      firstName: decoded?.FirstName || uname,
    }

    localStorage.setItem('medlog_token', token)
    localStorage.setItem('medlog_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('medlog_token')
    localStorage.removeItem('medlog_user')
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
