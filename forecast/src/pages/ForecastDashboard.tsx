import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { api } from '../services/api'

type RiskLevelUi = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

type Summary = {
  meta: {
    lastUpdated: string
    systemActive: boolean
  }
  stats: {
    activeCases: number
    totalCasesThisMonth: number
    forecastNextWeek: number
    criticalRegions: number
  }
  weeklyTrends: Array<{ week: string; cases: number }>
  forecastNext4Weeks: Array<{ week: string; cases: number; lower: number; upper: number }>
  regionalRiskAssessment: Array<{
    id: string
    name: string
    municipality: string
    province: string
    casesReported: number
    riskScore: number
    riskLevel: RiskLevelUi
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  activeAlerts: Array<{
    id: string
    title: string
    message: string
    riskLevel: string
    status: string
    triggeredAt: string
    barangay: null | {
      id: string
      name: string
      municipality: string
      province: string
    }
  }>
}

function riskBadge(level: RiskLevelUi) {
  switch (level) {
    case 'CRITICAL':
      return 'badge badge-danger'
    case 'HIGH':
      return 'badge badge-warning'
    case 'MODERATE':
      return 'badge badge-info'
    default:
      return 'badge badge-success'
  }
}

function riskRowBg(level: RiskLevelUi) {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-50 border-red-200'
    case 'HIGH':
      return 'bg-orange-50 border-orange-200'
    case 'MODERATE':
      return 'bg-yellow-50 border-yellow-200'
    default:
      return 'bg-green-50 border-green-200'
  }
}

function trendText(trend: 'increasing' | 'decreasing' | 'stable') {
  if (trend === 'increasing') return 'increasing'
  if (trend === 'decreasing') return 'decreasing'
  return 'stable'
}

export default function ForecastDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const res = await api.get('/public/forecast/summary')
        setSummary(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load forecast data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const headerMeta = useMemo(() => {
    const lastUpdated = summary?.meta?.lastUpdated ? new Date(summary.meta.lastUpdated) : null
    return {
      lastUpdatedText: lastUpdated ? format(lastUpdated, 'MMM d, yyyy HH:mm') : '—',
      systemActive: summary?.meta?.systemActive ?? false,
    }
  }, [summary])

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading forecast...</div>
  }

  if (error || !summary) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card border border-red-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Unable to load forecast</h1>
          <p className="text-sm text-gray-700">{error || 'Unknown error'}</p>
          <p className="text-xs text-gray-500 mt-3">
            Tip: ensure the backend is running and `VITE_API_URL` points to it.
          </p>
        </div>
      </div>
    )
  }

  const forecastChartData = summary.forecastNext4Weeks.map(d => ({
    ...d,
    // For nicer chart ordering, keep numeric values
    lowerBand: d.lower,
    upperBand: d.upper,
  }))

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dengue Surveillance Forecast</h1>
              <p className="text-sm text-gray-600">Real-time monitoring and forecasting</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-gray-500">Last Updated</div>
                <div className="text-sm font-medium text-gray-800">{headerMeta.lastUpdatedText}</div>
              </div>
              <span className={headerMeta.systemActive ? 'badge badge-success' : 'badge badge-danger'}>
                {headerMeta.systemActive ? 'System Active' : 'System Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Active Cases</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{summary.stats.activeCases.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <div className="w-5 h-5 bg-blue-500 rounded" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Cases (This Month)</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{summary.stats.totalCasesThisMonth.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Month to date</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <div className="w-5 h-5 bg-purple-500 rounded" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Forecasted (Next Week)</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{summary.stats.forecastNextWeek.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Model projection</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <div className="w-5 h-5 bg-orange-500 rounded" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Critical Regions</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{summary.stats.criticalRegions.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">High or critical risk</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <div className="w-5 h-5 bg-red-500 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cases Forecast (Next 4 Weeks)</h2>
              <span className="text-xs text-gray-500">Bounds are indicative</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={forecastChartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" angle={-30} textAnchor="end" height={60} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="upperBand" name="Upper Bound" stroke="#93c5fd" fill="#dbeafe" fillOpacity={0.6} />
                <Area type="monotone" dataKey="lowerBand" name="Lower Bound" stroke="#bfdbfe" fill="#ffffff" fillOpacity={0.0} />
                <Area type="monotone" dataKey="cases" name="Forecast" stroke="#0284c7" fill="#93c5fd" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends (Last {summary.weeklyTrends.length} Weeks)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={summary.weeklyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  interval={Math.max(0, Math.floor(summary.weeklyTrends.length / 8) - 1)}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" name="Cases" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Risk Assessment</h2>
            <div className="space-y-3">
              {summary.regionalRiskAssessment.map(r => (
                <div key={r.id} className={`border rounded-lg p-4 ${riskRowBg(r.riskLevel)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-xs text-gray-600">
                        {r.municipality}, {r.province} • {r.casesReported} cases reported (30d)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={riskBadge(r.riskLevel)}>{r.riskLevel}</div>
                      <div className="text-xs text-gray-600 mt-1">{trendText(r.trend)}</div>
                    </div>
                  </div>
                </div>
              ))}
              {summary.regionalRiskAssessment.length === 0 && (
                <div className="text-sm text-gray-600">No risk assessment data available.</div>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Risk legend: LOW, MODERATE, HIGH, CRITICAL
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {summary.activeAlerts.map(a => (
                <div
                  key={a.id}
                  className={`border rounded-lg p-4 ${
                    a.riskLevel === 'HIGH'
                      ? 'bg-red-50 border-red-200'
                      : a.riskLevel === 'MEDIUM'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                  {a.barangay && (
                    <div className="text-xs text-gray-600 mt-0.5">{a.barangay.name}</div>
                  )}
                  <div className="text-xs text-gray-700 mt-2 leading-5">{a.message}</div>
                  <div className="text-[11px] text-gray-500 mt-2">
                    {a.triggeredAt ? format(new Date(a.triggeredAt), 'PPp') : ''}
                  </div>
                </div>
              ))}
              {summary.activeAlerts.length === 0 && (
                <div className="text-sm text-gray-600">No active alerts.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


