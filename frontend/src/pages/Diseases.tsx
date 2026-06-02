import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/Modal';
import { useApiResource } from '../hooks/useApiResource';
import { diseaseService } from '../services/disease-service';
import { humanize } from '../utils/formatters';

export default function Diseases() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, loading, refetch } = useApiResource(() => diseaseService.list(), [], {
    errorMessage: 'Failed to load diseases',
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await diseaseService.remove(deleteId);
      toast.success(res.message);
      refetch();
    } catch {
      toast.error('Failed to delete disease');
    }
  };

  const diseases = data?.data.diseases ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disease Registry"
        subtitle="Configure the diseases tracked by the surveillance system"
        actions={
          <Link to="/diseases/new">
            <Button>Add Disease</Button>
          </Link>
        }
      />

      <Card title="Configured diseases" subtitle="Critical states include text + badge color for redundancy.">
        {loading ? (
          <Spinner label="Loading diseases..." />
        ) : diseases.length === 0 ? (
          <EmptyState
            icon="🦠"
            title="No diseases configured"
            description="Add the diseases your RHU monitors to get started."
            action={
              <Link to="/diseases/new">
                <Button>Add Disease</Button>
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Disease</th>
                  <th className="table-head-cell">Code</th>
                  <th className="table-head-cell">Category</th>
                  <th className="table-head-cell">Threshold</th>
                  <th className="table-head-cell">Status</th>
                  <th className="table-head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {diseases.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="table-cell whitespace-nowrap font-medium text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: d.color || '#94a3b8' }}
                        />
                        {d.name}
                      </span>
                    </td>
                    <td className="table-cell whitespace-nowrap">{d.code}</td>
                    <td className="table-cell whitespace-nowrap">
                      {humanize(d.category)}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      {d.caseThreshold}/mo · +{d.spikePercentage}%
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <Badge tone={d.isActive ? 'success' : 'info'}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex gap-3">
                        <Link to={`/diseases/${d.id}/edit`} className="text-primary-600 hover:text-primary-800">
                          Edit
                        </Link>
                        <button onClick={() => setDeleteId(d.id)} className="text-red-600 hover:text-red-800">
                          Delete
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
        isOpen={deleteId !== null}
        title="Delete Disease"
        message="Diseases with recorded cases will be deactivated to preserve history. Diseases with no cases will be permanently removed. Continue?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
