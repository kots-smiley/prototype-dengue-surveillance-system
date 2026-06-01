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

      <Card>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {humanize(u.role)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {u.barangay?.name ?? 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
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
