import { useState } from 'react'
import { examinationApi } from '../api/services'
import { AlertCircle } from 'lucide-react'
import Button from './Button'
import FormField from './FormField'
import './CreateExaminationForm.css'

export default function CreateExaminationForm({ patientId, doctorId, specializationId, specialization, onSuccess, onCancel }) {
  const [diagnosis, setDiagnosis] = useState('')
  const [paramValues, setParamValues] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleParamChange = (key, value) => {
    setParamValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!diagnosis.trim()) {
      setError('Please enter a diagnosis.')
      return
    }

    if (!specializationId) {
      setError('No specialization assigned to your account. Cannot create examination.')
      return
    }

    setLoading(true)
    try {
      const data = {}
      if (specialization?.requiredParameters) {
        specialization.requiredParameters.forEach((param) => {
          const val = paramValues[param.key]
          if (val !== undefined && val !== '') {
            if (param.type === 'number') {
              data[param.key] = Number(val)
            } else if (param.type === 'boolean') {
              data[param.key] = val === 'true'
            } else {
              data[param.key] = val
            }
          }
        })
      }

      await examinationApi.create({
        date: new Date().toISOString(),
        patientId,
        doctorId,
        specializationId,
        diagnosis: diagnosis.trim(),
        data,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data || 'Failed to create examination.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-exam-form">
      {error && (
        <div className="form-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {specialization && (
        <div className="spec-badge">
          Specialization: <strong>{specialization.name}</strong>
        </div>
      )}

      <FormField label="Diagnosis *">
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Enter diagnosis..."
          rows={3}
        />
      </FormField>

      {specialization?.requiredParameters?.length > 0 && (
        <div className="exam-params">
          <h4>Parameters</h4>
          <div className="params-grid">
            {specialization.requiredParameters.map((param) => (
              <FormField key={param.key} label={`${param.label}${param.unit ? ` (${param.unit})` : ''}`}>
                {param.type === 'boolean' ? (
                  <select
                    value={paramValues[param.key] || ''}
                    onChange={(e) => handleParamChange(param.key, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    value={paramValues[param.key] || ''}
                    onChange={(e) => handleParamChange(param.key, e.target.value)}
                    placeholder={param.label}
                    step={param.type === 'number' ? 'any' : undefined}
                  />
                )}
              </FormField>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Examination</Button>
      </div>
    </form>
  )
}
