import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientsPage from './pages/PatientsPage'
import PatientHistoryPage from './pages/PatientHistoryPage'
import SpecializationsPage from './pages/SpecializationsPage'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Doctor routes */}
          <Route path="/patients" element={<ProtectedRoute roles={['Doctor']}><PatientsPage /></ProtectedRoute>} />
          <Route path="/patients/:patientId/history" element={<ProtectedRoute roles={['Doctor']}><PatientHistoryPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/register" element={<ProtectedRoute roles={['Admin']}><RegisterPage /></ProtectedRoute>} />
          <Route path="/specializations" element={<ProtectedRoute roles={['Admin']}><SpecializationsPage /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={
            user?.role === 'Admin' ? <Navigate to="/specializations" replace /> : <Navigate to="/patients" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
