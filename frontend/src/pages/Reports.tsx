import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { EnvironmentalReport } from '../types'
import { format } from 'date-fns'

export default function Reports() {
  const [reports, setReports] = useState<EnvironmentalReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports')
      setReports(response.data.reports)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Environmental Reports</h1>
        <Link to="/reports/new" className="btn btn-primary">
          New Report
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Barangay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Risks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div>
                    <div className="text-6xl mb-4">🌍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-500 mb-4">Start tracking environmental risk factors by creating your first report.</p>
                    <Link to="/reports/new" className="btn btn-primary">
                      New Report
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const risks = [
                  report.stagnantWater && 'Stagnant Water',
                  report.poorWasteDisposal && 'Poor Waste Disposal',
                  report.cloggedDrainage && 'Clogged Drainage',
                  report.housingCongestion && 'Housing Congestion'
                ].filter(Boolean)

                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(report.dateReported), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.barangay?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {risks.length > 0 ? (
                          risks.map((risk, idx) => (
                          <span key={idx} className="badge badge-warning">
                            {risk}
                          </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No risks reported</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/reports/${report.id}/edit`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


