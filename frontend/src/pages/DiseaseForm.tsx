import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { diseaseService } from '../services/disease-service';
import { ApiError } from '../utils/api-client';
import { DISEASE_CATEGORY_OPTIONS, MONTH_NAMES } from '../configuration/options';

const diseaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  category: z.enum(['VECTOR_BORNE', 'WATER_BORNE', 'AIRBORNE', 'DIRECT_CONTACT', 'OTHER']),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Use a hex color like #ef4444').optional().or(z.literal('')),
  caseThreshold: z.coerce.number().int().min(1),
  spikePercentage: z.coerce.number().int().min(1).max(1000),
  isActive: z.boolean(),
  isNotifiable: z.boolean(),
});

type DiseaseFormData = z.infer<typeof diseaseSchema>;

export default function DiseaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [seasonalMonths, setSeasonalMonths] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiseaseFormData>({
    resolver: zodResolver(diseaseSchema),
    defaultValues: {
      category: 'VECTOR_BORNE',
      caseThreshold: 10,
      spikePercentage: 50,
      isActive: true,
      isNotifiable: true,
      color: '#0ea5e9',
    },
  });

  useEffect(() => {
    if (!id) return;
    diseaseService
      .getById(id)
      .then((res) => {
        const d = res.data.disease;
        setSeasonalMonths(d.seasonalMonths ?? []);
        reset({
          name: d.name,
          code: d.code,
          category: d.category,
          description: d.description ?? '',
          color: d.color ?? '#0ea5e9',
          caseThreshold: d.caseThreshold,
          spikePercentage: d.spikePercentage,
          isActive: d.isActive,
          isNotifiable: d.isNotifiable,
        });
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load disease');
        navigate('/diseases');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, reset]);

  const toggleMonth = (month: number) => {
    setSeasonalMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b)
    );
  };

  const onSubmit = async (data: DiseaseFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        code: data.code.toUpperCase(),
        color: data.color || undefined,
        seasonalMonths,
      };
      if (id) {
        await diseaseService.update(id, payload);
        toast.success('Disease updated');
      } else {
        await diseaseService.create(payload);
        toast.success('Disease created');
      }
      navigate('/diseases');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save disease');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading form..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title={id ? 'Edit Disease' : 'New Disease'} />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name *" {...register('name')} error={errors.name?.message} placeholder="e.g. Dengue" />
            <Input label="Code *" {...register('code')} error={errors.code?.message} placeholder="e.g. DENG" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Transmission Category *" {...register('category')} error={errors.category?.message}>
              {DISEASE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Input label="Badge Color" type="text" {...register('color')} error={errors.color?.message} placeholder="#0ea5e9" />
          </div>

          <Textarea label="Description" rows={2} {...register('description')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Monthly Case Threshold (HIGH) *"
              type="number"
              min={1}
              {...register('caseThreshold')}
              error={errors.caseThreshold?.message}
            />
            <Input
              label="Spike % Alert Threshold *"
              type="number"
              min={1}
              {...register('spikePercentage')}
              error={errors.spikePercentage?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seasonal Transmission Months
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MONTH_NAMES.map((name, idx) => {
                const month = idx + 1;
                const active = seasonalMonths.includes(month);
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => toggleMonth(month)}
                    className={`px-2 py-1 rounded-lg text-sm border transition-colors ${
                      active
                        ? 'bg-primary-100 border-primary-400 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Months when transmission is elevated (drives early-warning escalation).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Checkbox label="Active (tracked in the system)" {...register('isActive')} />
            <Checkbox label="PIDSR notifiable disease" {...register('isNotifiable')} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/diseases')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
