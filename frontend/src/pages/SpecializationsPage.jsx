import { useState, useEffect } from 'react'
import { specializationApi } from '../api/services'
import { Plus, Trash2, ShieldPlus, AlertCircle, Tag } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import CreateSpecializationForm from '../components/CreateSpecializationForm'
import './SpecializationsPage.css'

export default function SpecializationsPage() {
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)

  const loadSpecializations = async () => {
    setLoading(true)
    try {
      const res = await specializationApi.getAll()
      setSpecializations(res.data)
    } catch (err) {
      console.error('Failed to load specializations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpecializations()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this specialization?')) return
    setDeleteLoading(id)
    try {
      await specializationApi.delete(id)
      setSpecializations((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Failed to delete', err)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCreated = () => {
    setShowCreateModal(false)
    loadSpecializations()
  }

  return (
    <div className="spec-page">
      <div className="page-header">
        <div>
          <h1>Specializations</h1>
          <p>Manage medical specializations and their required parameters</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Specialization
        </Button>
      </div>

      {loading ? (
        <div className="spec-empty">Loading...</div>
      ) : specializations.length === 0 ? (
        <div className="spec-empty">
          <ShieldPlus size={40} />
          <p>No specializations yet. Create your first one.</p>
        </div>
      ) : (
        <div className="spec-grid">
          {specializations.map((spec) => (
            <div key={spec.id} className="spec-card">
              <div className="spec-card-header">
                <h3>{spec.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(spec.id)}
                  loading={deleteLoading === spec.id}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="spec-card-id">
                <Tag size={14} />
                <span>{spec.id}</span>
              </div>
              {spec.requiredParameters?.length > 0 && (
                <div className="spec-params">
                  <span className="spec-params-label">Parameters:</span>
                  <div className="spec-params-list">
                    {spec.requiredParameters.map((p) => (
                      <span key={p.key} className="param-chip">
                        {p.label}
                        {p.unit ? <small> ({p.unit})</small> : null}
                        <small className="param-type">{p.type}</small>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(!spec.requiredParameters || spec.requiredParameters.length === 0) && (
                <p className="spec-no-params">No required parameters</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Specialization">
        <CreateSpecializationForm onSuccess={handleCreated} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  )
}
