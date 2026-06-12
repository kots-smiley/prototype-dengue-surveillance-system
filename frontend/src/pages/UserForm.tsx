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
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { userService } from '../services/user-service';
import { barangayService } from '../services/barangay-service';
import { Barangay } from '../types';
import { ApiError } from '../utils/api-client';
import { USER_ROLE_OPTIONS } from '../configuration/options';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT', 'PHYSICIAN', 'NURSE', 'MIDWIFE']),
  barangayId: z.string().optional(),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserForm() {
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
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { isActive: true, role: 'BHW' },
  });

  const selectedRole = watch('role');
  const selectedBarangay = watch('barangayId');

  useEffect(() => {
    const load = async () => {
      try {
        const barangaysRes = await barangayService.list();
        setBarangays(barangaysRes.data.barangays);

        if (id) {
          const userRes = await userService.getById(id);
          const u = userRes.data.user;
          reset({
            email: u.email,
            password: '',
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            barangayId: u.barangayId ?? '',
            isActive: u.isActive,
          });
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load form data');
        if (id) navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const onSubmit = async (data: UserFormData) => {
    if (!id && !data.password) {
      toast.error('Password is required for new users');
      return;
    }
    setSubmitting(true);
    try {
      const base = {
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        barangayId: data.barangayId || undefined,
        isActive: data.isActive,
      };

      if (id) {
        await userService.update(id, base);
        toast.success('User updated');
      } else {
        await userService.create({ ...base, password: data.password as string });
        toast.success('User created');
      }
      navigate('/users');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading form..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={id ? 'Edit User' : 'New User'}
        subtitle="Complete identity details first, then account access settings."
      />

      <Card title="1) Identity">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name *" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Last Name *" {...register('lastName')} error={errors.lastName?.message} />
          </div>

          <Input label="Email *" type="email" {...register('email')} error={errors.email?.message} />

          <Card title="2) Access credentials" className="border border-slate-100 shadow-none">
            <Input
              label={id ? 'Password (leave blank to keep current)' : 'Password *'}
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder={id ? 'Leave blank to keep current password' : 'Enter password'}
            />
          </Card>

          <Card title="3) Role and assignment" className="border border-slate-100 shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Role *" {...register('role')} error={errors.role?.message}>
              {USER_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>

            <Select label={`Barangay${selectedRole === 'BHW' ? ' *' : ''}`} {...register('barangayId')}>
              <option value="">Select barangay</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            </div>

            {selectedRole === 'BHW' && !selectedBarangay && (
              <p className="text-sm text-yellow-600">BHW users should be assigned to a barangay.</p>
            )}
          </Card>

          <Card title="4) Account state" className="border border-slate-100 shadow-none">
            <Checkbox label="Active" {...register('isActive')} />
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
