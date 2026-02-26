import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/services'
import { Search, Plus, ChevronLeft, ChevronRight, FileText, User } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import CreatePatientForm from '../components/CreatePatientForm'
import './PatientsPage.css'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  const loadPatients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userApi.getPatients(page, 10, searchTerm)
      setPatients(res.data.items)
      setTotalPages(res.data.totalPages)
      setTotalCount(res.data.totalCount)
    } catch (err) {
      console.error('Failed to load patients', err)
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handlePatientCreated = () => {
    setShowCreateModal(false)
    loadPatients()
  }

  const handleSelectPatient = (patient) => {
    navigate(`/patients/${patient.id}/history`, { state: { patient } })
  }

  return (
    <div className="patients-page">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>{totalCount} patient{totalCount !== 1 ? 's' : ''} registered</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Patient
        </Button>
      </div>

      <div className="patients-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or JMBG..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>JMBG</th>
              <th>Gender</th>
              <th>Username</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="table-empty">Loading...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  <User size={32} />
                  <span>No patients found</span>
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id} onClick={() => handleSelectPatient(p)} className="patient-row">
                  <td className="patient-name">
                    <div className="patient-avatar">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="patient-jmbg">{p.jmbg || '-'}</td>
                  <td>{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : '-'}</td>
                  <td className="patient-username">{p.username}</td>
                  <td>
                    <button className="view-history-btn" title="View history">
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            icon={ChevronRight}
          >
            Next
          </Button>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register New Patient">
        <CreatePatientForm onSuccess={handlePatientCreated} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  )
}
