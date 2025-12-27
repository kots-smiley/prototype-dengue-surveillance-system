import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

export default function Exports() {
  const [loading, setLoading] = useState(false)

  const exportCases = async (format: 'csv' | 'json') => {
    setLoading(true)
    try {
      const response = await api.get(`/exports/cases?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      })

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `dengue-cases-${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = window.URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `dengue-cases-${Date.now()}.json`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      toast.success('Cases exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export cases')
    } finally {
      setLoading(false)
    }
  }

  const exportReports = async (format: 'csv' | 'json') => {
    setLoading(true)
    try {
      const response = await api.get(`/exports/reports?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      })

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `environmental-reports-${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = window.URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `environmental-reports-${Date.now()}.json`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      toast.success('Reports exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export reports')
    } finally {
      setLoading(false)
    }
  }

  const exportSummary = async () => {
    setLoading(true)
    try {
      const response = await api.get('/exports/summary')
      const dataStr = JSON.stringify(response.data.summary, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dengue-summary-${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Summary exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Data Exports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Export Cases</h2>
          <div className="space-y-2">
            <button
              onClick={() => exportCases('csv')}
              disabled={loading}
              className="w-full btn btn-primary"
            >
              Export as CSV
            </button>
            <button
              onClick={() => exportCases('json')}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              Export as JSON
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
          <div className="space-y-2">
            <button
              onClick={() => exportReports('csv')}
              disabled={loading}
              className="w-full btn btn-primary"
            >
              Export as CSV
            </button>
            <button
              onClick={() => exportReports('json')}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              Export as JSON
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Export Summary</h2>
          <button
            onClick={exportSummary}
            disabled={loading}
            className="w-full btn btn-primary"
          >
            Export Monthly Summary
          </button>
        </div>
      </div>
    </div>
  )
}


