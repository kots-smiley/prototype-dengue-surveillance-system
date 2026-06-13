import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Spinner } from '../components/ui/Spinner';
import { caseService } from '../services/case-service';
import { Case } from '../types';
import { ApiError } from '../utils/api-client';
import { formatDate, humanize } from '../utils/formatters';
import { CASE_STATUS_OPTIONS, CASE_OUTCOME_OPTIONS } from '../configuration/options';

const caseSchema = z.object({
  status: z.enum(['SUSPECTED', 'PROBABLE', 'CONFIRMED']),
  outcome: z.enum(['ONGOING', 'RECOVERED', 'DIED']),
  notes: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseSchema>;

export default function CaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseRecord, setCaseRecord] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: { outcome: 'ONGOING', status: 'SUSPECTED' },
  });

  useEffect(() => {
    if (!id) {
      navigate('/cases', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const caseRes = await caseService.getById(id);
        const c = caseRes.data.case;
        setCaseRecord(c);
        reset({
          status: c.status,
          outcome: c.outcome,
          notes: c.notes ?? '',
        });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load case');
        navigate('/cases');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const onSubmit = async (data: CaseFormData) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await caseService.update(id, {
        status: data.status,
        outcome: data.outcome,
        notes: data.notes?.trim() || undefined,
      });
      toast.success('Case updated');
      navigate('/cases');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save case');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading case..." />;
  }

  if (!caseRecord) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Update Case"
        subtitle="Cases are created from patient EMR. Update status and outcome here."
      />

      <Card title="Case summary">
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-slate-500">Disease</dt>
            <dd className="font-medium">{caseRecord.disease?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Barangay</dt>
            <dd className="font-medium">{caseRecord.barangay?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Date reported</dt>
            <dd className="font-medium">{formatDate(caseRecord.dateReported)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Demographics</dt>
            <dd className="font-medium">
              {caseRecord.age} y/o · {caseRecord.ageGroup} · {humanize(caseRecord.sex ?? 'Not specified')}
            </dd>
          </div>
          {caseRecord.patient?.patientCode && (
            <div>
              <dt className="text-slate-500">Patient code</dt>
              <dd className="font-medium">{caseRecord.patient.patientCode}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card title="Status and outcome">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select label="Status *" {...register('status')} error={errors.status?.message}>
              {CASE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Select label="Outcome *" {...register('outcome')} error={errors.outcome?.message}>
              {CASE_OUTCOME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <Textarea label="Notes" rows={3} {...register('notes')} />

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/cases')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
