import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { PrintPreviewModal } from '../components/clinical/PrintPreviewModal';
import { ReferralPrint } from '../components/clinical/ReferralPrint';
import { useApiResource } from '../hooks/useApiResource';
import { referralService } from '../services/ehr-service';
import { formatDate, humanize } from '../utils/formatters';
import { Patient, Referral } from '../types';

const STATUS_BADGE: Record<string, string> = {
  REQUESTED: 'badge badge-info',
  ACCEPTED: 'badge badge-warning',
  COMPLETED: 'badge badge-success',
  REJECTED: 'badge badge-danger',
};

export default function Referrals() {
  const [status, setStatus] = useState('');
  const [printReferral, setPrintReferral] = useState<Referral | null>(null);
  const { data, loading, refetch } = useApiResource(
    () => referralService.list({ status: status || undefined }),
    [status],
    { errorMessage: 'Failed to load referrals' }
  );

  const referrals = data?.data.referrals ?? [];

  const update = async (id: string, next: string) => {
    try {
      await referralService.updateStatus(id, next);
      toast.success(`Referral ${humanize(next).toLowerCase()}`);
      refetch();
    } catch {
      toast.error('Failed to update referral');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Referrals" subtitle="Inter-facility continuity of care (ISO 13940)" />

      <Card title="Referral worklist" subtitle="Track patients referred between facilities.">
        <div className="mb-4 max-w-xs">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>

        {loading ? (
          <Spinner label="Loading referrals..." />
        ) : referrals.length === 0 ? (
          <EmptyState icon="🔄" title="No referrals" description="Referrals between facilities will appear here." />
        ) : (
          <div className="space-y-3">
            {referrals.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {r.patient?.firstName} {r.patient?.lastName}{' '}
                      <span className="font-mono text-xs text-slate-500">{r.patient?.patientCode}</span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {r.fromFacility?.name ?? 'Unknown'} → {r.toFacility?.name ?? 'Unknown'} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${r.priority === 'EMERGENCY' ? 'badge-danger' : r.priority === 'URGENT' ? 'badge-warning' : 'badge-info'}`}>
                      {humanize(r.priority)}
                    </span>
                    <span className={STATUS_BADGE[r.status]}>{humanize(r.status)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Reason:</span> {r.reason}
                </p>
                {r.clinicalSummary && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{r.clinicalSummary}</p>
                )}
                {r.status === 'REQUESTED' && (
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => update(r.id, 'ACCEPTED')}>Accept</Button>
                    <Button variant="danger" onClick={() => update(r.id, 'REJECTED')}>
                      Reject
                    </Button>
                  </div>
                )}
                {r.status === 'ACCEPTED' && (
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => update(r.id, 'COMPLETED')}>Mark Completed</Button>
                    {r.patient && (
                      <Button variant="secondary" onClick={() => setPrintReferral(r)}>
                        Print
                      </Button>
                    )}
                  </div>
                )}
                {(r.status === 'COMPLETED' || r.status === 'REQUESTED') && r.patient && (
                  <div className="mt-3">
                    <Button variant="secondary" onClick={() => setPrintReferral(r)}>
                      Print letter
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <PrintPreviewModal
        isOpen={Boolean(printReferral && printReferral.patient)}
        title="Referral Letter"
        onClose={() => setPrintReferral(null)}
      >
        {printReferral?.patient && (
          <ReferralPrint patient={printReferral.patient as Patient} referral={printReferral} />
        )}
      </PrintPreviewModal>
    </div>
  );
}
