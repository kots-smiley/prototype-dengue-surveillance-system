import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Barangay } from '../types'

const reportSchema = z.object({
  barangayId: z.string().min(1, 'Barangay is required'),
  dateReported: z.string().optional(),
  stagnantWater: z.boolean().default(false),
  poorWasteDisposal: z.boolean().default(false),
  cloggedDrainage: z.boolean().default(false),
  housingCongestion: z.boolean().default(false),
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional()
})

type ReportFormData = z.infer<typeof reportSchema>

export default function ReportForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      stagnantWater: false,
      poorWasteDisposal: false,
      cloggedDrainage: false,
      housingCongestion: false
    }
  })

  useEffect(() => {
    fetchBarangays()
    if (id) {
      fetchReport()
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

  const fetchReport = async () => {
    try {
      const response = await api.get(`/reports/${id}`)
      const reportData = response.data.report
      setValue('barangayId', reportData.barangayId)
      setValue('dateReported', reportData.dateReported.split('T')[0])
      setValue('stagnantWater', reportData.stagnantWater)
      setValue('poorWasteDisposal', reportData.poorWasteDisposal)
      setValue('cloggedDrainage', reportData.cloggedDrainage)
      setValue('housingCongestion', reportData.housingCongestion)
      setValue('photoUrl', reportData.photoUrl || '')
      setValue('notes', reportData.notes || '')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load report')
      navigate('/reports')
    }
  }

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true)
    try {
      if (id) {
        await api.put(`/reports/${id}`, data)
        toast.success('Report updated successfully')
      } else {
        await api.post('/reports', data)
        toast.success('Report created successfully')
      }
      navigate('/reports')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {id ? 'Edit Report' : 'New Environmental Report'}
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
            Date Reported
          </label>
          <input
            type="date"
            {...register('dateReported')}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Environmental Risk Factors
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('stagnantWater')}
                className="mr-2"
              />
              <span>Stagnant Water</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('poorWasteDisposal')}
                className="mr-2"
              />
              <span>Poor Waste Disposal</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('cloggedDrainage')}
                className="mr-2"
              />
              <span>Clogged Drainage</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('housingCongestion')}
                className="mr-2"
              />
              <span>Housing Congestion</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL (optional)
          </label>
          <input
            type="url"
            {...register('photoUrl')}
            className="input"
            placeholder="https://example.com/photo.jpg"
          />
          {errors.photoUrl && (
            <p className="text-red-600 text-sm mt-1">{errors.photoUrl.message}</p>
          )}
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
            onClick={() => navigate('/reports')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}


