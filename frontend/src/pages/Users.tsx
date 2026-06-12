import { useState, ReactNode } from 'react';
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
import { userService } from '../services/user-service';
import { humanize } from '../utils/formatters';

export default function Users() {
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);
  const { data, loading, refetch } = useApiResource(() => userService.list(), [], {
    errorMessage: 'Failed to load users',
  });

  const handleDelete = async () => {
    if (!target) return;
    try {
      await userService.remove(target.id);
      toast.success('User deactivated');
      refetch();
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const users = data?.data.users ?? [];

  const message: ReactNode = target ? (
    <div>
      <p>
        Deactivate <strong>{target.name}</strong>?
      </p>
      <p className="mt-2 text-sm text-gray-600">
        The account will be disabled but its data is preserved.
      </p>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage RHU staff, health workers, and encoders"
        actions={
          <Link to="/users/new">
            <Button>Add User</Button>
          </Link>
        }
      />

      <Card title="User accounts" subtitle="Role, status, and barangay are grouped for quick scanning.">
        {loading ? (
          <Spinner label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No users yet"
            description="Create the first user account."
            action={
              <Link to="/users/new">
                <Button>Add User</Button>
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Name</th>
                  <th className="table-head-cell">Email</th>
                  <th className="table-head-cell">Role</th>
                  <th className="table-head-cell">Barangay</th>
                  <th className="table-head-cell">Status</th>
                  <th className="table-head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="table-cell whitespace-nowrap text-slate-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="table-cell whitespace-nowrap">{u.email}</td>
                    <td className="table-cell whitespace-nowrap">
                      {humanize(u.role)}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      {u.barangay?.name ?? 'N/A'}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <Badge tone={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex gap-3">
                        <Link to={`/users/${u.id}/edit`} className="text-primary-600 hover:text-primary-800">
                          Edit
                        </Link>
                        <button
                          onClick={() => setTarget({ id: u.id, name: `${u.firstName} ${u.lastName}` })}
                          className="text-red-600 hover:text-red-800"
                        >
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
        isOpen={target !== null}
        title="Deactivate User"
        message={message}
        confirmText="Deactivate"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
