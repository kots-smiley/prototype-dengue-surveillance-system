import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Barangay } from '../types'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function Barangays() {
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; barangayId: string | null }>({
    isOpen: false,
    barangayId: null
  })

  useEffect(() => {
    fetchBarangays()
  }, [])

  const fetchBarangays = async () => {
    try {
      const response = await api.get('/barangays')
      setBarangays(response.data.barangays)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load barangays')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.barangayId) return
    
    try {
      await api.delete(`/barangays/${deleteDialog.barangayId}`)
      toast.success('Barangay deleted successfully')
      fetchBarangays()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete barangay')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading barangays...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-900">Barangays</h1>
        <Link to="/barangays/new" className="btn btn-primary">
          Add New Barangay
        </Link>
      </div>

      {barangays.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Barangays Found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first barangay.</p>
          <Link to="/barangays/new" className="btn btn-primary">
            Add New Barangay
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barangays.map((barangay) => (
            <div key={barangay.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
              {barangay.name}
            </h3>
                <div className="flex gap-2">
                  <Link
                    to={`/barangays/${barangay.id}/edit`}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, barangayId: barangay.id })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            <p className="text-sm text-gray-600 mb-1">Code: {barangay.code}</p>
            <p className="text-sm text-gray-600 mb-1">
              {barangay.municipality}, {barangay.province}
            </p>
            {barangay.population && (
              <p className="text-sm text-gray-600">Population: {barangay.population.toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, barangayId: null })}
        onConfirm={handleDelete}
        title="Delete Barangay"
        message="Are you sure you want to delete this barangay? This action cannot be undone and may affect associated users, cases, and reports."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}


