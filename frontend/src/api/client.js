import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const client = axios.create({ baseURL: API_BASE })

export const api = {
  getStats: () => client.get('/cases/stats').then(r => r.data),
  getCases: (limit = 20) => client.get(`/cases/?limit=${limit}`).then(r => r.data),
  getCase: (caseId) => client.get(`/cases/${caseId}`).then(r => r.data),
  uploadDataset: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post('/cases/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total))
      },
    }).then(r => r.data)
  },
  getCauseList: (limit = 10) => client.get(`/causelist/?limit=${limit}`).then(r => r.data),
  getPriorityMatrix: () => client.get('/causelist/matrix').then(r => r.data),
  runClustering: (nClusters = 5) => client.post(`/clusters/run?n_clusters=${nClusters}`).then(r => r.data),
  getClusters: () => client.get('/clusters/').then(r => r.data),
  getSimilarCases: (caseId) => client.get(`/clusters/similar/${caseId}`).then(r => r.data),
  summarizeCase: (caseId) => client.post(`/summarize/case/${caseId}`).then(r => r.data),
}

export default api
