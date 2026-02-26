import { useState } from 'react'
import { authApi } from '../api/services'
import { AlertCircle } from 'lucide-react'
import Button from './Button'
import FormField from './FormField'
import './CreatePatientForm.css'

export default function CreatePatientForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    gender: '',
    jmbg: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.jmbg) {
      setError('Please fill in all required fields.')
      return
    }

    if (!/^\d{13}$/.test(form.jmbg)) {
      setError('JMBG must be exactly 13 digits.')
      return
    }

    setLoading(true)
    try {
      await authApi.register({
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: 1, // Patient
        gender: form.gender || null,
        jmbg: form.jmbg,
        specializationId: null,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data || 'Failed to create patient.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-patient-form">
      {error && (
        <div className="form-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-row">
        <FormField label="First Name *">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
        </FormField>
        <FormField label="Last Name *">
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
        </FormField>
      </div>

      <div className="form-row">
        <FormField label="Username *">
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
        </FormField>
        <FormField label="Password *">
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" />
        </FormField>
      </div>

      <div className="form-row">
        <FormField label="JMBG *">
          <input name="jmbg" value={form.jmbg} onChange={handleChange} placeholder="13-digit JMBG" maxLength={13} />
        </FormField>
        <FormField label="Gender">
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </FormField>
      </div>

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Patient</Button>
      </div>
    </form>
  )
}
