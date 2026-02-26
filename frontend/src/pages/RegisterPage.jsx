import { useState, useEffect } from 'react'
import { authApi, specializationApi } from '../api/services'
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../components/Button'
import FormField from '../components/FormField'
import './RegisterPage.css'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Doctor',
    gender: '',
    jmbg: '',
    specializationId: '',
  })
  const [specializations, setSpecializations] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSpecializations()
  }, [])

  const loadSpecializations = async () => {
    try {
      const res = await specializationApi.getAll()
      setSpecializations(res.data)
    } catch {
      // Specializations may not be available for all roles
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.username || !form.password || !form.firstName || !form.lastName) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.role === 'Patient' && !form.jmbg) {
      setError('JMBG is required for patients.')
      return
    }

    if (form.role === 'Patient' && form.jmbg && !/^\d{13}$/.test(form.jmbg)) {
      setError('JMBG must be exactly 13 digits.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role === 'Doctor' ? 0 : form.role === 'Patient' ? 1 : 2,
        gender: form.gender || null,
        jmbg: form.role === 'Patient' ? form.jmbg : null,
        specializationId: form.role === 'Doctor' ? form.specializationId || null : null,
      }
      await authApi.register(payload)
      setSuccess(`User "${form.username}" registered successfully.`)
      setForm({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'Doctor',
        gender: '',
        jmbg: '',
        specializationId: '',
      })
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="page-header">
        <h1>Register Staff</h1>
        <p>Create new user accounts for doctors, patients, and administrators</p>
      </div>

      <div className="register-card">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <FormField label="First Name *">
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
              />
            </FormField>
            <FormField label="Last Name *">
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Username *">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
              />
            </FormField>
            <FormField label="Password *">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Role *">
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="Doctor">Doctor</option>
                <option value="Patient">Patient</option>
                <option value="Admin">Admin</option>
              </select>
            </FormField>
            <FormField label="Gender">
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </FormField>
          </div>

          {form.role === 'Patient' && (
            <FormField label="JMBG *">
              <input
                type="text"
                name="jmbg"
                value={form.jmbg}
                onChange={handleChange}
                placeholder="13-digit JMBG"
                maxLength={13}
              />
            </FormField>
          )}

          {form.role === 'Doctor' && (
            <FormField label="Specialization">
              <select name="specializationId" value={form.specializationId} onChange={handleChange}>
                <option value="">-- Select Specialization --</option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </FormField>
          )}

          <Button type="submit" loading={loading} icon={UserPlus}>
            Register User
          </Button>
        </form>
      </div>
    </div>
  )
}
