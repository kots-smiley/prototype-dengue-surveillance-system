import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/Modal';
import { useApiResource } from '../hooks/useApiResource';
import { facilityService } from '../services/facility-service';
import { humanize } from '../utils/formatters';

export default function Facilities() {
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const { data, loading, refetch } = useApiResource(() => facilityService.list(), [], {
    errorMessage: 'Failed to load facilities',
  });

  const facilities = data?.data.facilities ?? [];

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await facilityService.remove(deactivateId);
      toast.success('Facility deactivated');
      refetch();
    } catch {
      toast.error('Failed to deactivate facility');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        subtitle="Health facility registry for the Municipality of Lopez"
        actions={
          <Link to="/facilities/new">
            <Button>Add Facility</Button>
          </Link>
        }
      />

      <Card title="Facility registry" subtitle="Every RHU, barangay health station, and hospital in the network.">
        {loading ? (
          <Spinner label="Loading facilities..." />
        ) : facilities.length === 0 ? (
          <EmptyState
            icon="🏥"
            title="No facilities yet"
            description="Register the RHU and barangay health stations to enable cross-facility records."
            action={
              <Link to="/facilities/new">
                <Button>Add Facility</Button>
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Code</th>
                  <th className="table-head-cell">Name</th>
                  <th className="table-head-cell">Type</th>
                  <th className="table-head-cell">Barangay</th>
                  <th className="table-head-cell">Status</th>
                  <th className="table-head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {facilities.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="table-cell whitespace-nowrap font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">
                      {f.code}
                    </td>
                    <td className="table-cell whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">
                      {f.name}
                    </td>
                    <td className="table-cell whitespace-nowrap">{humanize(f.type)}</td>
                    <td className="table-cell whitespace-nowrap">{f.barangay?.name ?? 'N/A'}</td>
                    <td className="table-cell whitespace-nowrap">
                      <span className={`badge ${f.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex gap-3">
                        <Link to={`/facilities/${f.id}/edit`} className="text-primary-600 hover:text-primary-800">
                          Edit
                        </Link>
                        <button onClick={() => setDeactivateId(f.id)} className="text-red-600 hover:text-red-800">
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={deactivateId !== null}
        title="Deactivate Facility"
        message="This hides the facility from active use but preserves its historical records. Continue?"
        confirmText="Deactivate"
        variant="danger"
        onConfirm={handleDeactivate}
        onClose={() => setDeactivateId(null)}
      />
    </div>
  );
}
