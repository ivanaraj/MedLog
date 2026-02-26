import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Users, ShieldPlus, UserPlus, Activity } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Activity size={24} />
          <span>MedLog</span>
        </div>

        <div className="navbar-links">
          {user?.role === 'Doctor' && (
            <NavLink to="/patients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Users size={18} />
              <span>Patients</span>
            </NavLink>
          )}

          {user?.role === 'Admin' && (
            <>
              <NavLink to="/specializations" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <ShieldPlus size={18} />
                <span>Specializations</span>
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <UserPlus size={18} />
                <span>Register Staff</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-user">
          <span className="navbar-username">{user?.firstName || user?.username}</span>
          <span className="navbar-role">{user?.role}</span>
          <button className="navbar-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
