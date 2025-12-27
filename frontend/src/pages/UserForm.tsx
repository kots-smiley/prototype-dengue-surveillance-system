import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Barangay, UserRole } from '../types'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT']),
  barangayId: z.string().optional(),
  isActive: z.boolean().default(true)
})

type UserFormData = z.infer<typeof userSchema>

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isActive: true
    }
  })

  const selectedRole = watch('role')

  useEffect(() => {
    fetchBarangays()
    if (id) {
      fetchUser()
    }
  }, [id])

  const fetchBarangays = async () => {
    try {
      const response = await api.get('/barangays')
      setBarangays(response.data.barangays)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load barangays')
    }
  }

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`)
      const userData = response.data.user
      setValue('email', userData.email)
      setValue('firstName', userData.firstName)
      setValue('lastName', userData.lastName)
      setValue('role', userData.role)
      setValue('barangayId', userData.barangayId || '')
      setValue('isActive', userData.isActive)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load user')
      navigate('/users')
    }
  }

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      const payload: any = {
        ...data,
        barangayId: data.barangayId || undefined
      }

      // Only include password if it's a new user or if password is provided
      if (!id) {
        if (!data.password || data.password === '') {
          toast.error('Password is required for new users')
          setLoading(false)
          return
        }
        payload.password = data.password
      } else if (data.password && data.password !== '') {
        payload.password = data.password
      } else {
        // Remove password from payload if updating and password is empty
        delete payload.password
      }

      if (id) {
        await api.put(`/users/${id}`, payload)
        toast.success('User updated successfully')
      } else {
        await api.post('/users', payload)
        toast.success('User created successfully')
      }
      navigate('/users')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const roles: { value: UserRole; label: string }[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'BHW', label: 'Barangay Health Worker' },
    { value: 'HOSPITAL_ENCODER', label: 'Hospital Encoder' },
    { value: 'RESIDENT', label: 'Resident' }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {id ? 'Edit User' : 'New User'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              {...register('firstName')}
              className="input"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              {...register('lastName')}
              className="input"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            {...register('email')}
            className="input"
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {id ? '(leave blank to keep current)' : '*'}
          </label>
          <input
            type="password"
            {...register('password')}
            className="input"
            placeholder={id ? 'Leave blank to keep current password' : 'Enter password'}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select {...register('role')} className="input">
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barangay {selectedRole === 'BHW' && '*'}
            </label>
            <select {...register('barangayId')} className="input">
              <option value="">Select barangay</option>
              {barangays.map((barangay) => (
                <option key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </option>
              ))}
            </select>
            {errors.barangayId && (
              <p className="text-red-600 text-sm mt-1">{errors.barangayId.message}</p>
            )}
            {selectedRole === 'BHW' && !watch('barangayId') && (
              <p className="text-yellow-600 text-sm mt-1">
                BHW users should be assigned to a barangay
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : id ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
