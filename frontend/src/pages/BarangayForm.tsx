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
import { Spinner } from '../components/ui/Spinner';
import { barangayService } from '../services/barangay-service';
import { ApiError } from '../utils/api-client';

const barangaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  municipality: z.string().min(1, 'Municipality is required'),
  province: z.string().min(1, 'Province is required'),
  population: z.coerce.number().int().positive().optional().or(z.literal('')),
});

type BarangayFormData = z.infer<typeof barangaySchema>;

export default function BarangayForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BarangayFormData>({
    resolver: zodResolver(barangaySchema),
    defaultValues: { municipality: 'Lopez', province: 'Quezon' },
  });

  useEffect(() => {
    if (!id) return;
    barangayService
      .getById(id)
      .then((res) => {
        const b = res.data.barangay;
        reset({
          name: b.name,
          code: b.code,
          municipality: b.municipality,
          province: b.province,
          population: b.population ?? '',
        });
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load barangay');
        navigate('/barangays');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, reset]);

  const onSubmit = async (data: BarangayFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        population: data.population === '' ? undefined : Number(data.population),
      };
      if (id) {
        await barangayService.update(id, payload);
        toast.success('Barangay updated');
      } else {
        await barangayService.create(payload);
        toast.success('Barangay created');
      }
      navigate('/barangays');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save barangay');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading form..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title={id ? 'Edit Barangay' : 'New Barangay'} />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Barangay Name *" {...register('name')} error={errors.name?.message} placeholder="e.g. Magsaysay (Poblacion)" />
          <Input label="Barangay Code *" {...register('code')} error={errors.code?.message} placeholder="e.g. LPZ-MGS" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Municipality *" {...register('municipality')} error={errors.municipality?.message} />
            <Input label="Province *" {...register('province')} error={errors.province?.message} />
          </div>

          <Input
            label="Population (optional)"
            type="number"
            min={1}
            {...register('population')}
            error={errors.population?.message}
            placeholder="e.g. 5000"
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/barangays')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
