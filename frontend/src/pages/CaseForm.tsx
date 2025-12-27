import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Barangay } from '../types'

const caseSchema = z.object({
  barangayId: z.string().min(1, 'Barangay is required'),
  dateReported: z.string().min(1, 'Date is required'),
  status: z.enum(['SUSPECTED', 'CONFIRMED']),
  source: z.enum(['PUBLIC_HOSPITAL', 'PRIVATE_HOSPITAL', 'RHU', 'BHW']),
  notes: z.string().optional()
})

type CaseFormData = z.infer<typeof caseSchema>

export default function CaseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema)
  })

  useEffect(() => {
    fetchBarangays()
    if (id) {
      fetchCase()
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

  const fetchCase = async () => {
    try {
      const response = await api.get(`/cases/${id}`)
      const caseData = response.data.case
      setValue('barangayId', caseData.barangayId)
      setValue('dateReported', caseData.dateReported.split('T')[0])
      setValue('status', caseData.status)
      setValue('source', caseData.source)
      setValue('notes', caseData.notes || '')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load case')
      navigate('/cases')
    }
  }

  const onSubmit = async (data: CaseFormData) => {
    setLoading(true)
    try {
      if (id) {
        await api.put(`/cases/${id}`, data)
        toast.success('Case updated successfully')
      } else {
        await api.post('/cases', data)
        toast.success('Case created successfully')
      }
      navigate('/cases')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {id ? 'Edit Case' : 'New Dengue Case'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay *
          </label>
          <select {...register('barangayId')} className="input">
            <option value="">Select barangay</option>
            {barangays.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.barangayId && (
            <p className="text-red-600 text-sm mt-1">{errors.barangayId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Reported *
          </label>
          <input
            type="date"
            {...register('dateReported')}
            className="input"
          />
          {errors.dateReported && (
            <p className="text-red-600 text-sm mt-1">{errors.dateReported.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select {...register('status')} className="input">
              <option value="SUSPECTED">Suspected</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source *
            </label>
            <select {...register('source')} className="input">
              <option value="PUBLIC_HOSPITAL">Public Hospital</option>
              <option value="PRIVATE_HOSPITAL">Private Hospital</option>
              <option value="RHU">RHU</option>
              <option value="BHW">BHW</option>
            </select>
            {errors.source && (
              <p className="text-red-600 text-sm mt-1">{errors.source.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            className="input"
            rows={3}
          />
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
            onClick={() => navigate('/cases')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}


