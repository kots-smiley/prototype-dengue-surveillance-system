import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { api } from '../services/api'

const barangaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  municipality: z.string().min(1, 'Municipality is required'),
  province: z.string().min(1, 'Province is required'),
  population: z.number().int().positive().optional().or(z.literal(''))
})

type BarangayFormData = z.infer<typeof barangaySchema>

export default function BarangayForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<BarangayFormData>({
    resolver: zodResolver(barangaySchema)
  })

  useEffect(() => {
    if (id) {
      fetchBarangay()
    }
  }, [id])

  const fetchBarangay = async () => {
    try {
      const response = await api.get(`/barangays/${id}`)
      const barangayData = response.data.barangay
      setValue('name', barangayData.name)
      setValue('code', barangayData.code)
      setValue('municipality', barangayData.municipality)
      setValue('province', barangayData.province)
      setValue('population', barangayData.population || '')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load barangay')
      navigate('/barangays')
    }
  }

  const onSubmit = async (data: BarangayFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        population: data.population === '' ? undefined : data.population
      }

      if (id) {
        await api.put(`/barangays/${id}`, payload)
        toast.success('Barangay updated successfully')
      } else {
        await api.post('/barangays', payload)
        toast.success('Barangay created successfully')
      }
      navigate('/barangays')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save barangay')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {id ? 'Edit Barangay' : 'New Barangay'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay Name *
          </label>
          <input
            type="text"
            {...register('name')}
            className="input"
            placeholder="e.g., Barangay Poblacion"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay Code *
          </label>
          <input
            type="text"
            {...register('code')}
            className="input"
            placeholder="e.g., BRG-001"
          />
          {errors.code && (
            <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipality *
            </label>
            <input
              type="text"
              {...register('municipality')}
              className="input"
              placeholder="e.g., Sample Municipality"
            />
            {errors.municipality && (
              <p className="text-red-600 text-sm mt-1">{errors.municipality.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province *
            </label>
            <input
              type="text"
              {...register('province')}
              className="input"
              placeholder="e.g., Sample Province"
            />
            {errors.province && (
              <p className="text-red-600 text-sm mt-1">{errors.province.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Population (optional)
          </label>
          <input
            type="number"
            {...register('population', { valueAsNumber: true })}
            className="input"
            placeholder="e.g., 5000"
            min="1"
          />
          {errors.population && (
            <p className="text-red-600 text-sm mt-1">{errors.population.message}</p>
          )}
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
            onClick={() => navigate('/barangays')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
