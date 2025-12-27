import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface BarangayCaseData {
  id: string
  name: string
  code: string
  municipality: string
  province: string
  caseCount: number
  population: number
}

export default function Dashboard() {
  const [data, setData] = useState<BarangayCaseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get('/dashboard/barangay-cases')
      setData(response.data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  const totalCases = data.reduce((sum, item) => sum + item.caseCount, 0)
  const sortedData = [...data].sort((a, b) => b.caseCount - a.caseCount)

  // Color coding based on case count
  const getColor = (caseCount: number, maxCases: number) => {
    if (caseCount === 0) return '#94a3b8' // gray
    const ratio = caseCount / maxCases
    if (ratio > 0.7) return '#ef4444' // red - high
    if (ratio > 0.4) return '#f59e0b' // orange - medium
    return '#10b981' // green - low
  }

  const maxCases = Math.max(...data.map(d => d.caseCount), 1)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/analytics" className="btn btn-primary">
          View Analytics
        </Link>
      </div>

      {/* Summary Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Barangays</h3>
            <p className="text-3xl font-bold text-gray-900">{data.length}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Cases</h3>
            <p className="text-3xl font-bold text-primary-600">{totalCases}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Cases per Barangay</h3>
            <p className="text-3xl font-bold text-gray-900">
              {data.length > 0 ? (totalCases / data.length).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Barangay Case Count Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Cases by Barangay</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [value, 'Cases']}
              labelFormatter={(label) => `Barangay: ${label}`}
            />
            <Legend />
            <Bar dataKey="caseCount" name="Number of Cases" radius={[8, 8, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.caseCount, maxCases)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Barangay Case Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Barangay Case Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number of Cases</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.municipality}, {item.province}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      className={`font-semibold ${
                        item.caseCount === 0 
                          ? 'text-gray-500' 
                          : item.caseCount > maxCases * 0.7 
                          ? 'text-red-600' 
                          : item.caseCount > maxCases * 0.4 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                      }`}
                    >
                      {item.caseCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


