import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmModal } from '../components/ui/Modal';
import { DiseaseFilter } from '../components/domain/DiseaseFilter';
import { useApiResource } from '../hooks/useApiResource';
import { caseService } from '../services/case-service';
import { diseaseService } from '../services/disease-service';
import { caseStatusBadge, formatDate, humanize } from '../utils/formatters';
import { CASE_STATUS_OPTIONS, CASE_SOURCE_OPTIONS } from '../configuration/options';
import { DEFAULT_PAGE_SIZE } from '../configuration/constants';

export default function Cases() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState({ diseaseId: '', status: '', source: '', startDate: '', endDate: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: diseasesData } = useApiResource(() => diseaseService.list({ isActive: 'true' }), []);
  const { data, loading, refetch } = useApiResource(
    () =>
      caseService.list({
        page,
        limit,
        diseaseId: filters.diseaseId || undefined,
        status: filters.status || undefined,
        source: filters.source || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
    [page, limit, filters],
    { errorMessage: 'Failed to load cases' }
  );

  const updateFilter = (key: string, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await caseService.remove(deleteId);
      toast.success('Case deleted');
      refetch();
    } catch {
      toast.error('Failed to delete case');
    }
  };

  const cases = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const diseases = diseasesData?.data.diseases ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        subtitle="Reported disease cases across all barangays"
        actions={
          <Link to="/cases/new">
            <Button>Add New Case</Button>
          </Link>
        }
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <DiseaseFilter
            diseases={diseases}
            value={filters.diseaseId}
            onChange={(v) => updateFilter('diseaseId', v)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              {CASE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => updateFilter('source', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              {CASE_SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <Spinner label="Loading cases..." />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No cases found"
            description="Get started by recording your first case report."
            action={
              <Link to="/cases/new">
                <Button>Add New Case</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disease</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(c.dateReported)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {c.disease?.name ?? 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {c.barangay?.name ?? 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={caseStatusBadge(c.status)}>{humanize(c.status)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {humanize(c.source)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <Link to={`/cases/${c.id}/edit`} className="text-primary-600 hover:text-primary-800">
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteId(c.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            )}
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Case"
        message="Are you sure you want to delete this case? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
