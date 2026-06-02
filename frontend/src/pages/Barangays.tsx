import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/Modal';
import { useApiResource } from '../hooks/useApiResource';
import { barangayService } from '../services/barangay-service';

export default function Barangays() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, loading, refetch } = useApiResource(() => barangayService.list(), [], {
    errorMessage: 'Failed to load barangays',
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await barangayService.remove(deleteId);
      toast.success('Barangay deleted');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete barangay');
    }
  };

  const barangays = data?.data.barangays ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barangays"
        subtitle="Geographic units within the municipality"
        actions={
          <Link to="/barangays/new">
            <Button>Add Barangay</Button>
          </Link>
        }
      />

      {loading ? (
        <Spinner label="Loading barangays..." />
      ) : barangays.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏘️"
            title="No barangays yet"
            description="Add the barangays your RHU covers."
            action={
              <Link to="/barangays/new">
                <Button>Add Barangay</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barangays.map((b) => (
            <Card key={b.id} className="hover:shadow-md transition-shadow" title={b.name}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <Link
                    to={`/barangays/${b.id}/edit`}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mb-1 text-sm text-slate-600">Code: {b.code}</p>
              <p className="mb-1 text-sm text-slate-600">
                {b.municipality}, {b.province}
              </p>
              {b.population != null && (
                <p className="text-sm text-slate-600">
                  Population: {b.population.toLocaleString()}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Barangay"
        message="Barangays with linked users, cases, reports, or alerts cannot be deleted. Continue?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
