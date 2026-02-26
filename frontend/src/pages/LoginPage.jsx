import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, LogIn, AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import FormField from '../components/FormField'
import './LoginPage.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const user = await login(username, password)
      if (user.role === 'Admin') {
        navigate('/specializations')
      } else {
        navigate('/patients')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password.')
      } else if (err.response?.status === 403) {
        setError('Only administrators and doctors can log in.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Activity size={32} />
          </div>
          <h1>MedLog</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <FormField label="Username">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
            />
          </FormField>

          <FormField label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormField>

          <Button type="submit" loading={loading} icon={LogIn}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
