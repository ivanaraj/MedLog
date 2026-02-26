import api from './axios'

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
}

export const userApi = {
  getAll: () => api.get('/user'),
  getById: (id) => api.get(`/user/${id}`),
  getPatients: (page = 1, pageSize = 10, searchTerm = '') =>
    api.get('/user/patients', { params: { page, pageSize, searchTerm } }),
  getDoctorSpecialization: (doctorId) =>
    api.get(`/user/doctor/${doctorId}/specialization`),
}

export const examinationApi = {
  getAll: () => api.get('/examination'),
  create: (examination) => api.post('/examination', examination),
  delete: (id) => api.delete(`/examination/${id}`),
  getPatientHistory: (patientId, page = 1, pageSize = 10) =>
    api.get(`/examination/patient/${patientId}/history`, { params: { page, pageSize } }),
}

export const specializationApi = {
  getAll: () => api.get('/specialization'),
  getById: (id) => api.get(`/specialization/${id}`),
  create: (specialization) => api.post('/specialization', specialization),
  delete: (id) => api.delete(`/specialization/${id}`),
}
