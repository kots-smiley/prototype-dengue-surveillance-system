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
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { patientService } from '../services/patient-service';
import { barangayService } from '../services/barangay-service';
import { facilityService } from '../services/facility-service';
import { Barangay, Facility } from '../types';
import { ApiError } from '../utils/api-client';
import { toDateInputValue } from '../utils/formatters';
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
} from '../configuration/options';

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  sex: z.enum(['MALE', 'FEMALE']),
  civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'OTHER']).optional().or(z.literal('')),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  barangayId: z.string().optional(),
  homeFacilityId: z.string().optional(),
  philhealthNo: z.string().optional(),
  bloodType: z.string().optional(),
  consentGiven: z.boolean().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { sex: 'MALE', consentGiven: false },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [barangaysRes, facilitiesRes] = await Promise.all([
          barangayService.list(),
          facilityService.list({ isActive: 'true' }),
        ]);
        setBarangays(barangaysRes.data.barangays);
        setFacilities(facilitiesRes.data.facilities);

        if (id) {
          const res = await patientService.getById(id);
          const p = res.data.patient;
          reset({
            firstName: p.firstName,
            middleName: p.middleName ?? '',
            lastName: p.lastName,
            birthDate: toDateInputValue(p.birthDate),
            sex: p.sex,
            civilStatus: (p.civilStatus as PatientFormData['civilStatus']) ?? '',
            contactNumber: p.contactNumber ?? '',
            address: p.address ?? '',
            barangayId: p.barangayId ?? '',
            homeFacilityId: p.homeFacilityId ?? '',
            philhealthNo: p.philhealthNo ?? '',
            bloodType: p.bloodType ?? '',
            consentGiven: p.consentGiven,
            notes: p.notes ?? '',
          });
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load form data');
        if (id) navigate('/patients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const onSubmit = async (data: PatientFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        middleName: data.middleName?.trim() || undefined,
        civilStatus: data.civilStatus || undefined,
        contactNumber: data.contactNumber?.trim() || undefined,
        address: data.address?.trim() || undefined,
        barangayId: data.barangayId || undefined,
        homeFacilityId: data.homeFacilityId || undefined,
        philhealthNo: data.philhealthNo?.trim() || undefined,
        bloodType: data.bloodType || undefined,
        notes: data.notes?.trim() || undefined,
      };
      if (id) {
        await patientService.update(id, payload);
        toast.success('Patient updated');
      } else {
        await patientService.create(payload);
        toast.success('Patient registered');
      }
      navigate('/patients');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save patient');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading form..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={id ? 'Edit Patient' : 'Register Patient'}
        subtitle="Demographics first, then consent and optional details."
      />

      <Card title="1) Identity">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="First name *" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Middle name" {...register('middleName')} error={errors.middleName?.message} />
            <Input label="Last name *" {...register('lastName')} error={errors.lastName?.message} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Birth date *" type="date" {...register('birthDate')} error={errors.birthDate?.message} />
            <Select label="Sex *" {...register('sex')} error={errors.sex?.message}>
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Select label="Civil status" {...register('civilStatus')} error={errors.civilStatus?.message}>
              <option value="">Not specified</option>
              {CIVIL_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <Card title="2) Contact and address" className="border border-slate-100 shadow-none">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Contact number" {...register('contactNumber')} />
              <Select label="Barangay" {...register('barangayId')}>
                <option value="">Not specified</option>
                {barangays.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <Select label="Home facility" {...register('homeFacilityId')}>
              <option value="">Not specified</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
            <Input label="Address" {...register('address')} />
          </Card>

          <Card title="3) Health identifiers" className="border border-slate-100 shadow-none">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="PhilHealth number" {...register('philhealthNo')} />
              <Select label="Blood type" {...register('bloodType')}>
                <option value="">Unknown</option>
                {BLOOD_TYPE_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card title="4) Data privacy consent" className="border border-slate-100 shadow-none">
            <p className="mb-3 text-sm text-slate-600">
              Under the Data Privacy Act (RA 10173), patient consent is required before clinical
              encounters can be recorded.
            </p>
            <Checkbox
              label="Patient has given informed consent to store and process their medical record"
              {...register('consentGiven')}
            />
          </Card>

          <Card title="5) Optional notes" className="border border-slate-100 shadow-none">
            <Textarea label="Notes" rows={3} {...register('notes')} />
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Register'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/patients')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
