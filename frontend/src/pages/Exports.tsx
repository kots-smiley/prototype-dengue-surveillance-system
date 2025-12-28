import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

export default function Exports() {
  const [loading, setLoading] = useState(false)

  const downloadBlob = (data: BlobPart, filename: string, mime?: string) => {
    const blob = new Blob([data], mime ? { type: mime } : undefined)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const exportCases = async (format: 'csv' | 'xlsx') => {
    setLoading(true)
    try {
      const response = await api.get(`/exports/cases?format=${format}`, {
        responseType: 'blob'
      })

      downloadBlob(
        response.data,
        `dengue-cases-${Date.now()}.${format}`,
        format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      toast.success('Cases exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export cases')
    } finally {
      setLoading(false)
    }
  }

  const exportReports = async (format: 'csv' | 'xlsx') => {
    setLoading(true)
    try {
      const response = await api.get(`/exports/reports?format=${format}`, {
        responseType: 'blob'
      })

      downloadBlob(
        response.data,
        `environmental-reports-${Date.now()}.${format}`,
        format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      toast.success('Reports exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export reports')
    } finally {
      setLoading(false)
    }
  }

  const exportSummary = async (format: 'csv' | 'xlsx') => {
    setLoading(true)
    try {
      const response = await api.get(`/exports/summary?format=${format}`, { responseType: 'blob' })
      downloadBlob(
        response.data,
        `dengue-summary-${Date.now()}.${format}`,
        format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
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
              onClick={() => exportCases('xlsx')}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              Export as Excel
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
              onClick={() => exportReports('xlsx')}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              Export as Excel
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Export Summary</h2>
          <div className="space-y-2">
            <button
              onClick={() => exportSummary('csv')}
              disabled={loading}
              className="w-full btn btn-primary"
            >
              Export as CSV
            </button>
            <button
              onClick={() => exportSummary('xlsx')}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              Export as Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


