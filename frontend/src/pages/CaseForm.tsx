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
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Spinner } from '../components/ui/Spinner';
import { caseService } from '../services/case-service';
import { diseaseService } from '../services/disease-service';
import { barangayService } from '../services/barangay-service';
import { Barangay, Disease } from '../types';
import { ApiError } from '../utils/api-client';
import { toDateInputValue } from '../utils/formatters';
import {
  CASE_STATUS_OPTIONS,
  CASE_OUTCOME_OPTIONS,
  CASE_SOURCE_OPTIONS,
  SEX_OPTIONS,
  AGE_GROUP_OPTIONS,
} from '../configuration/options';

const caseSchema = z.object({
  diseaseId: z.string().min(1, 'Disease is required'),
  barangayId: z.string().min(1, 'Barangay is required'),
  dateReported: z.string().min(1, 'Date is required'),
  onsetDate: z.string().optional(),
  age: z.coerce.number().int().min(0).max(120),
  ageGroup: z.string().min(1, 'Age group is required'),
  sex: z.enum(['MALE', 'FEMALE']).optional().or(z.literal('')),
  status: z.enum(['SUSPECTED', 'PROBABLE', 'CONFIRMED']),
  outcome: z.enum(['ONGOING', 'RECOVERED', 'DIED']),
  source: z.enum(['PUBLIC_HOSPITAL', 'PRIVATE_HOSPITAL', 'RHU', 'BHW']),
  notes: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseSchema>;

export default function CaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
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
    const load = async () => {
      try {
        const [diseasesRes, barangaysRes] = await Promise.all([
          diseaseService.list({ isActive: 'true' }),
          barangayService.list(),
        ]);
        setDiseases(diseasesRes.data.diseases);
        setBarangays(barangaysRes.data.barangays);

        if (id) {
          const caseRes = await caseService.getById(id);
          const c = caseRes.data.case;
          reset({
            diseaseId: c.diseaseId,
            barangayId: c.barangayId,
            dateReported: toDateInputValue(c.dateReported),
            onsetDate: toDateInputValue(c.onsetDate),
            age: c.age,
            ageGroup: c.ageGroup,
            sex: (c.sex as 'MALE' | 'FEMALE') ?? '',
            status: c.status,
            outcome: c.outcome,
            source: c.source,
            notes: c.notes ?? '',
          });
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load form data');
        if (id) navigate('/cases');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const onSubmit = async (data: CaseFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        sex: data.sex || undefined,
        onsetDate: data.onsetDate || undefined,
      };
      if (id) {
        await caseService.update(id, payload);
        toast.success('Case updated');
      } else {
        await caseService.create(payload);
        toast.success('Case created');
      }
      navigate('/cases');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save case');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading form..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title={id ? 'Edit Case' : 'New Case'} />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Disease *" {...register('diseaseId')} error={errors.diseaseId?.message}>
              <option value="">Select disease</option>
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Select label="Barangay *" {...register('barangayId')} error={errors.barangayId?.message}>
              <option value="">Select barangay</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date Reported *" type="date" {...register('dateReported')} error={errors.dateReported?.message} />
            <Input label="Onset Date" type="date" {...register('onsetDate')} error={errors.onsetDate?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Age *" type="number" min={0} max={120} {...register('age')} error={errors.age?.message} />
            <Select label="Age Group *" {...register('ageGroup')} error={errors.ageGroup?.message}>
              <option value="">Select</option>
              {AGE_GROUP_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <Select label="Sex" {...register('sex')} error={errors.sex?.message}>
              <option value="">Not specified</option>
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Select label="Source *" {...register('source')} error={errors.source?.message}>
              <option value="">Select source</option>
              {CASE_SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <Textarea label="Notes" rows={3} {...register('notes')} />

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Create'}
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
