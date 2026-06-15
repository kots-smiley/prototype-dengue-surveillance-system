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
import { useAuth } from '../hooks/useAuth';
import { riskReportService } from '../services/risk-report-service';
import { formatDate, humanize } from '../utils/formatters';
import { RISK_FACTORS_BY_CATEGORY } from '../configuration/options';
import { DISEASE_CATEGORY_OPTIONS } from '../configuration/options';
import { DEFAULT_PAGE_SIZE } from '../configuration/constants';
import { RiskReport } from '../types';

const REVIEWER_ROLES = ['ADMIN', 'HEALTH_OFFICER', 'BHW'] as const;

function activeFactorLabels(report: RiskReport): string {
  const factors = RISK_FACTORS_BY_CATEGORY[report.category] ?? [];
  const labels = factors
    .filter((f) => (report as unknown as Record<string, boolean>)[f.key])
    .map((f) => f.label);
  return labels.length ? labels.join(', ') : '—';
}

function submitterLabel(report: RiskReport): string {
  if (report.reporter) {
    return `${report.reporter.firstName} ${report.reporter.lastName}`;
  }
  if (report.submittedByName?.trim()) {
    return report.submittedByName.trim();
  }
  return 'Anonymous resident';
}

export default function Reports() {
  const { user } = useAuth();
  const canReview = user ? REVIEWER_ROLES.includes(user.role as (typeof REVIEWER_ROLES)[number]) : false;
  const canManageReports = user?.role === 'ADMIN' || user?.role === 'BHW';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [category, setCategory] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, loading, refreshing, refetch } = useApiResource(
    () => riskReportService.list({ page, limit, category: category || undefined }),
    [page, limit, category],
    { errorMessage: 'Failed to load risk reports' }
  );

  const {
    data: pendingData,
    loading: pendingLoading,
    refetch: refetchPending,
  } = useApiResource(
    () => {
      if (!canReview) {
        return Promise.resolve({
          success: true,
          message: '',
          data: {
            items: [] as RiskReport[],
            pagination: { page: 1, limit: 50, total: 0, pages: 0 },
          },
        });
      }
      return riskReportService.list({ status: 'PENDING', limit: 50 });
    },
    [canReview],
    { errorMessage: 'Failed to load pending submissions' }
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

  const handleReview = async (id: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      await riskReportService.review(id, action, rejectionReason);
      toast.success(action === 'approve' ? 'Report approved' : 'Report rejected');
      refetchPending();
      refetch();
    } catch {
      toast.error(`Failed to ${action} report`);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectId) return;
    await handleReview(rejectId, 'reject', rejectReason.trim() || undefined);
    setRejectId(null);
    setRejectReason('');
  };

  const reports = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const pendingReports = pendingData?.data.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Risk Reports"
        subtitle="Community risk factors that feed the early-warning system"
        actions={
          canManageReports ? (
            <Link to="/reports/new">
              <Button>Add Report</Button>
            </Link>
          ) : undefined
        }
      />

      {canReview && (
        <Card
          title="Pending resident submissions"
          subtitle="Review community reports from the public forecast site before they enter surveillance."
        >
          {pendingLoading ? (
            <Spinner label="Loading pending submissions..." />
          ) : pendingReports.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No pending submissions"
              description="Resident-submitted reports awaiting review will appear here."
            />
          ) : (
            <div className="space-y-3">
              {pendingReports.map((r) => (
                <div key={r.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {r.barangay?.name ?? 'Unknown barangay'} · {humanize(r.category)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(r.dateReported)} · {activeFactorLabels(r)}
                      </p>
                      {r.notes && (
                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.notes}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Submitted by {submitterLabel(r)}
                        {r.submittedByContact ? ` · ${r.submittedByContact}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleReview(r.id, 'approve')}>Approve</Button>
                      <Button variant="danger" onClick={() => setRejectId(r.id)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

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

      <Card title="Approved risk reports" subtitle="Only approved reports feed early-warning and analytics.">
        {refreshing && <p className="mb-3 text-xs font-medium text-slate-500">Refreshing reports...</p>}
        {loading ? (
          <Spinner label="Loading reports..." />
        ) : reports.length === 0 ? (
          <EmptyState
            icon="🏘️"
            title="No approved reports yet"
            description="Approved environmental risk reports will appear here."
            action={
              canManageReports ? (
                <Link to="/reports/new">
                  <Button>Add Report</Button>
                </Link>
              ) : undefined
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
                    <th className="table-head-cell">Source</th>
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
                      <td className="table-cell whitespace-nowrap">
                        {r.source === 'RESIDENT' ? 'Resident' : 'Staff'}
                      </td>
                      <td className="table-cell max-w-md">
                        {activeFactorLabels(r)}
                      </td>
                      <td className="table-cell whitespace-nowrap">
                        {canManageReports ? (
                          <div className="flex gap-3">
                            <Link to={`/reports/${r.id}/edit`} className="text-primary-600 hover:text-primary-800">
                              Edit
                            </Link>
                            <button onClick={() => setDeleteId(r.id)} className="text-red-600 hover:text-red-800">
                              Delete
                            </button>
                          </div>
                        ) : (
                          '—'
                        )}
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

      <ConfirmModal
        isOpen={rejectId !== null}
        title="Reject submission"
        message={
          <div className="space-y-3">
            <p>Optionally provide a reason for rejecting this resident submission.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              placeholder="Reason (optional)"
            />
          </div>
        }
        confirmText="Reject"
        variant="danger"
        onConfirm={handleRejectConfirm}
        onClose={() => {
          setRejectId(null);
          setRejectReason('');
        }}
      />
    </div>
  );
}
