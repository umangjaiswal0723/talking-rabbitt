import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const uploadFile = (file, sheet = null) => {
  const formData = new FormData()
  formData.append('file', file)
  const url = sheet ? `/upload?sheet=${encodeURIComponent(sheet)}` : '/upload'
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const switchFile   = (filename) => api.post(`/switch-file?filename=${encodeURIComponent(filename)}`)
export const removeFile   = (filename) => api.delete(`/remove-file?filename=${encodeURIComponent(filename)}`)

export const getKPIs            = () => api.get('/kpis')
export const getCharts          = () => api.get('/charts')
export const getTrends          = () => api.get('/trends')
export const getAnomalies       = () => api.get('/anomalies')
export const getSummary         = () => api.get('/summary')
export const getRecommendations = () => api.get('/recommendations')
export const getDatasetStatus   = () => api.get('/dataset/status')

export const getForecast = (column, method = 'linear', steps = 10) =>
  api.get('/forecast', { params: { column, method, steps } })

export const sendChatMessage = (message, history = []) =>
  api.post('/chat', { message, history })

export const checkHealth = () => api.get('/health')

export default api
