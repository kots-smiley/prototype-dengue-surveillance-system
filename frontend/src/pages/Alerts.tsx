import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useApiResource } from '../hooks/useApiResource';
import { alertService } from '../services/alert-service';
import { formatDate, humanize, riskLevelBadge } from '../utils/formatters';
import { ALERT_STATUS_OPTIONS } from '../configuration/options';

export default function Alerts() {
  const [status, setStatus] = useState('ACTIVE');

  const { data, loading, refetch } = useApiResource(
    () => alertService.list({ status: status || undefined, limit: 100 }),
    [status],
    { errorMessage: 'Failed to load alerts' }
  );

  const resolve = async (id: string) => {
    try {
      await alertService.resolve(id);
      toast.success('Alert resolved');
      refetch();
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const dismiss = async (id: string) => {
    try {
      await alertService.updateStatus(id, 'DISMISSED');
      toast.success('Alert dismissed');
      refetch();
    } catch {
      toast.error('Failed to dismiss alert');
    }
  };

  const alerts = data?.data.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Early Warning Alerts" subtitle="Rule-based risk alerts by disease and barangay" />

      <Card>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option value="">All</option>
            {ALERT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading alerts..." />
      ) : alerts.length === 0 ? (
        <Card>
          <EmptyState
            icon="✅"
            title="No alerts"
            description="No early-warning alerts match the selected status."
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card border-l-4 ${
                alert.riskLevel === 'HIGH'
                  ? 'border-red-500'
                  : alert.riskLevel === 'MEDIUM'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{alert.title}</h3>
                    <span className={riskLevelBadge(alert.riskLevel)}>{alert.riskLevel}</span>
                    {alert.disease && (
                      <span className="badge badge-info">{alert.disease.name}</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>Barangay: {alert.barangay?.name ?? 'N/A'}</p>
                    <p>Status: {humanize(alert.status)}</p>
                    <p>Triggered: {formatDate(alert.triggeredAt)}</p>
                  </div>
                </div>
                {alert.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => resolve(alert.id)}>
                      Resolve
                    </Button>
                    <Button variant="secondary" onClick={() => dismiss(alert.id)}>
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
