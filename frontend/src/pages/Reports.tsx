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
import { Select } from '../components/ui/Select';
import { useApiResource } from '../hooks/useApiResource';
import { riskReportService } from '../services/risk-report-service';
import { formatDate, humanize } from '../utils/formatters';
import { RISK_FACTORS_BY_CATEGORY } from '../configuration/options';
import { DISEASE_CATEGORY_OPTIONS } from '../configuration/options';
import { DEFAULT_PAGE_SIZE } from '../configuration/constants';
import { RiskReport } from '../types';

function activeFactorLabels(report: RiskReport): string {
  const factors = RISK_FACTORS_BY_CATEGORY[report.category] ?? [];
  const labels = factors
    .filter((f) => (report as unknown as Record<string, boolean>)[f.key])
    .map((f) => f.label);
  return labels.length ? labels.join(', ') : '—';
}

export default function Reports() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [category, setCategory] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, loading, refreshing, refetch } = useApiResource(
    () => riskReportService.list({ page, limit, category: category || undefined }),
    [page, limit, category],
    { errorMessage: 'Failed to load risk reports' }
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await riskReportService.remove(deleteId);
      toast.success('Report deleted');
      refetch();
    } catch {
      toast.error('Failed to delete report');
    }
  };

  const reports = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Risk Reports"
        subtitle="Community risk factors that feed the early-warning system"
        actions={
          <Link to="/reports/new">
            <Button>Add Report</Button>
          </Link>
        }
      />

      <Card title="Filter context" subtitle="Limit to one category for faster review.">
        <div className="max-w-xs">
          <Select
            label="Category"
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">All categories</option>
            {DISEASE_CATEGORY_OPTIONS.filter((o) =>
              ['VECTOR_BORNE', 'WATER_BORNE', 'AIRBORNE'].includes(o.value)
            ).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card title="Risk reports" subtitle="Risk factors are shown as explicit text labels.">
        {refreshing && <p className="mb-3 text-xs font-medium text-slate-500">Refreshing reports...</p>}
        {loading ? (
          <Spinner label="Loading reports..." />
        ) : reports.length === 0 ? (
          <EmptyState
            icon="🏘️"
            title="No risk reports yet"
            description="Record environmental risk factors observed in the community."
            action={
              <Link to="/reports/new">
                <Button>Add Report</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="table-shell">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="table-head">
                  <tr>
                    <th className="table-head-cell">Date</th>
                    <th className="table-head-cell">Barangay</th>
                    <th className="table-head-cell">Category</th>
                    <th className="table-head-cell">Risk Factors</th>
                    <th className="table-head-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="table-cell whitespace-nowrap">
                        {formatDate(r.dateReported)}
                      </td>
                      <td className="table-cell whitespace-nowrap">
                        {r.barangay?.name ?? 'N/A'}
                      </td>
                      <td className="table-cell whitespace-nowrap">
                        {humanize(r.category)}
                      </td>
                      <td className="table-cell max-w-md">
                        {activeFactorLabels(r)}
                      </td>
                      <td className="table-cell whitespace-nowrap">
                        <div className="flex gap-3">
                          <Link to={`/reports/${r.id}/edit`} className="text-primary-600 hover:text-primary-800">
                            Edit
                          </Link>
                          <button onClick={() => setDeleteId(r.id)} className="text-red-600 hover:text-red-800">
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
        title="Delete Report"
        message="Are you sure you want to delete this risk report?"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
