import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { examinationApi, userApi, specializationApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Calendar, Stethoscope, FileText } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import CreateExaminationForm from '../components/CreateExaminationForm'
import './PatientHistoryPage.css'

export default function PatientHistoryPage() {
  const { patientId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [patient, setPatient] = useState(location.state?.patient || null)
  const [examinations, setExaminations] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [doctorSpecId, setDoctorSpecId] = useState(null)
  const [specialization, setSpecialization] = useState(null)
  const [specMap, setSpecMap] = useState({})

  // Load patient info if not passed via state
  useEffect(() => {
    if (!patient) {
      userApi.getById(patientId).then((res) => setPatient(res.data)).catch(console.error)
    }
  }, [patientId, patient])

  // Load doctor specialization
  useEffect(() => {
    if (user?.id) {
      userApi.getDoctorSpecialization(user.id).then((res) => {
        const specId = res.data
        setDoctorSpecId(specId)
        if (specId) {
          specializationApi.getById(specId).then((r) => setSpecialization(r.data)).catch(console.error)
        }
      }).catch(console.error)
    }
  }, [user?.id])

  // Load all specializations for display
  useEffect(() => {
    specializationApi.getAll().then((res) => {
      const map = {}
      res.data.forEach((s) => { map[s.id] = s.name })
      setSpecMap(map)
    }).catch(console.error)
  }, [])

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await examinationApi.getPatientHistory(patientId, page, 10)
      setExaminations(res.data.items)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }, [patientId, page])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleCreated = () => {
    setShowCreateModal(false)
    loadHistory()
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="history-page">
      <button className="back-link" onClick={() => navigate('/patients')}>
        <ArrowLeft size={18} />
        Back to Patients
      </button>

      <div className="page-header">
        <div className="patient-info-header">
          <div className="patient-avatar-lg">
            {patient?.firstName?.[0]}{patient?.lastName?.[0]}
          </div>
          <div>
            <h1>{patient?.firstName} {patient?.lastName}</h1>
            <p>JMBG: {patient?.jmbg || 'N/A'} {patient?.gender ? `  |  ${patient.gender === 'M' ? 'Male' : 'Female'}` : ''}</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Examination
        </Button>
      </div>

      <div className="history-list">
        {loading ? (
          <div className="history-empty">Loading...</div>
        ) : examinations.length === 0 ? (
          <div className="history-empty">
            <FileText size={40} />
            <p>No examinations found for this patient.</p>
          </div>
        ) : (
          examinations.map((exam) => (
            <div key={exam.id} className="exam-card">
              <div className="exam-card-header">
                <div className="exam-date">
                  <Calendar size={16} />
                  {formatDate(exam.date)}
                </div>
                <div className="exam-spec">
                  <Stethoscope size={16} />
                  {specMap[exam.specializationId] || exam.specializationId}
                </div>
              </div>
              <div className="exam-diagnosis">
                <strong>Diagnosis:</strong> {exam.diagnosis}
              </div>
              {exam.data && Object.keys(exam.data).length > 0 && (
                <div className="exam-data">
                  {Object.entries(exam.data).map(([key, value]) => (
                    <div key={key} className="exam-data-item">
                      <span className="exam-data-key">{key}</span>
                      <span className="exam-data-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} icon={ChevronLeft}>
            Previous
          </Button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} icon={ChevronRight}>
            Next
          </Button>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Examination">
        <CreateExaminationForm
          patientId={patientId}
          doctorId={user?.id}
          specializationId={doctorSpecId}
          specialization={specialization}
          onSuccess={handleCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}
