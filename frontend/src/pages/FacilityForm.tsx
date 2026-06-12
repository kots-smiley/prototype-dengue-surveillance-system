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
import { Spinner } from '../components/ui/Spinner';
import { facilityService } from '../services/facility-service';
import { barangayService } from '../services/barangay-service';
import { Barangay } from '../types';
import { ApiError } from '../utils/api-client';
import { FACILITY_TYPE_OPTIONS } from '../configuration/options';

const facilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum([
    'RHU_MAIN',
    'BARANGAY_HEALTH_STATION',
    'MUNICIPAL_HOSPITAL',
    'DISTRICT_HOSPITAL',
    'PRIVATE_CLINIC',
    'LABORATORY',
    'PHARMACY',
  ]),
  barangayId: z.string().optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

export default function FacilityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: { type: 'BARANGAY_HEALTH_STATION' },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const barangaysRes = await barangayService.list();
        setBarangays(barangaysRes.data.barangays);
        if (id) {
          const res = await facilityService.getById(id);
          const f = res.data.facility;
          reset({
            name: f.name,
            code: f.code,
            type: f.type,
            barangayId: f.barangayId ?? '',
            address: f.address ?? '',
            contactNumber: f.contactNumber ?? '',
          });
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load form data');
        if (id) navigate('/facilities');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const onSubmit = async (data: FacilityFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        barangayId: data.barangayId || undefined,
        address: data.address?.trim() || undefined,
        contactNumber: data.contactNumber?.trim() || undefined,
      };
      if (id) {
        await facilityService.update(id, payload);
        toast.success('Facility updated');
      } else {
        await facilityService.create(payload);
        toast.success('Facility created');
      }
      navigate('/facilities');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save facility');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading form..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={id ? 'Edit Facility' : 'Add Facility'} subtitle="Register a health facility in the network." />
      <Card title="Facility details">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Name *" {...register('name')} error={errors.name?.message} />
            <Input label="Code *" {...register('code')} error={errors.code?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select label="Type *" {...register('type')} error={errors.type?.message}>
              {FACILITY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Select label="Barangay" {...register('barangayId')}>
              <option value="">Not specified</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <Input label="Address" {...register('address')} />
          <Input label="Contact number" {...register('contactNumber')} />
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/facilities')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
