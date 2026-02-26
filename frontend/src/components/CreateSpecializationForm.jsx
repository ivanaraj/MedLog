import { useState } from 'react'
import { specializationApi } from '../api/services'
import { AlertCircle, Plus, X } from 'lucide-react'
import Button from './Button'
import FormField from './FormField'
import './CreateSpecializationForm.css'

export default function CreateSpecializationForm({ onSuccess, onCancel }) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [params, setParams] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const addParam = () => {
    setParams((prev) => [...prev, { key: '', label: '', type: 'string', unit: '' }])
  }

  const removeParam = (index) => {
    setParams((prev) => prev.filter((_, i) => i !== index))
  }

  const updateParam = (index, field, value) => {
    setParams((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!id.trim() || !name.trim()) {
      setError('ID and Name are required.')
      return
    }

    for (const p of params) {
      if (!p.key.trim() || !p.label.trim()) {
        setError('All parameters must have a Key and Label.')
        return
      }
    }

    setLoading(true)
    try {
      await specializationApi.create({
        id: id.trim(),
        name: name.trim(),
        requiredParameters: params.map((p) => ({
          key: p.key.trim(),
          label: p.label.trim(),
          type: p.type,
          unit: p.unit.trim(),
        })),
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data || 'Failed to create specialization.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-spec-form">
      {error && (
        <div className="form-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-row">
        <FormField label="ID *">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. cardiology" />
        </FormField>
        <FormField label="Name *">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cardiology" />
        </FormField>
      </div>

      <div className="params-section">
        <div className="params-header">
          <h4>Required Parameters</h4>
          <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addParam}>
            Add Parameter
          </Button>
        </div>

        {params.length === 0 && (
          <p className="params-empty">No parameters added yet.</p>
        )}

        {params.map((param, index) => (
          <div key={index} className="param-row">
            <FormField label="Key">
              <input
                value={param.key}
                onChange={(e) => updateParam(index, 'key', e.target.value)}
                placeholder="e.g. bloodPressure"
              />
            </FormField>
            <FormField label="Label">
              <input
                value={param.label}
                onChange={(e) => updateParam(index, 'label', e.target.value)}
                placeholder="e.g. Blood Pressure"
              />
            </FormField>
            <FormField label="Type">
              <select value={param.type} onChange={(e) => updateParam(index, 'type', e.target.value)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
            </FormField>
            <FormField label="Unit">
              <input
                value={param.unit}
                onChange={(e) => updateParam(index, 'unit', e.target.value)}
                placeholder="e.g. mmHg"
              />
            </FormField>
            <button type="button" className="remove-param-btn" onClick={() => removeParam(index)} title="Remove">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Specialization</Button>
      </div>
    </form>
  )
}
