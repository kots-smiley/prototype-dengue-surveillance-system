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
import { Select } from '../components/ui/Select';

export default function Alerts() {
  const [status, setStatus] = useState('ACTIVE');

  const { data, loading, refreshing, refetch } = useApiResource(
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

      <Card title="Alert status filter" subtitle="Switch between active and resolved alerts.">
        <div className="max-w-xs">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {ALERT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
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
          {refreshing && <p className="text-xs font-medium text-slate-500">Refreshing alerts...</p>}
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
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
                    {alert.disease && <span className="badge badge-info">{alert.disease.name}</span>}
                  </div>
                  <p className="mb-2 text-slate-700">{alert.message}</p>
                  <div className="space-y-0.5 text-sm text-slate-500">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
