import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Alert } from '../types'
import { format } from 'date-fns'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts?status=ACTIVE')
      setAlerts(response.data.alerts)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/resolve`)
      toast.success('Alert resolved successfully')
      fetchAlerts()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve alert')
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'badge badge-danger'
      case 'MEDIUM':
        return 'badge badge-warning'
      default:
        return 'badge badge-info'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Early Warning Alerts</h1>

      {alerts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Alerts</h3>
          <p className="text-gray-500">All systems are operating normally. No early warning alerts at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="card border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{alert.title}</h3>
                    <span className={getRiskBadge(alert.riskLevel)}>
                      {alert.riskLevel}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <div className="text-sm text-gray-500">
                    <p>Barangay: {alert.barangay?.name || 'N/A'}</p>
                    <p>Triggered: {format(new Date(alert.triggeredAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="btn btn-secondary text-sm"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


