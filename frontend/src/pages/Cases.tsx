import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { DengueCase } from '../types'
import { format } from 'date-fns'
import { ConfirmDialog } from '../components/ConfirmDialog'

export default function Cases() {
  const [cases, setCases] = useState<DengueCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; caseId: string | null }>({
    isOpen: false,
    caseId: null
  })
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchCases()
  }, [filters])

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.source) params.append('source', filters.source)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await api.get(`/cases?${params.toString()}`)
      setCases(response.data.cases)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.caseId) return
    
    try {
      await api.delete(`/cases/${deleteDialog.caseId}`)
      toast.success('Case deleted successfully')
      fetchCases()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete case')
    }
  }

  const filteredCases = useMemo(() => {
    if (!searchQuery) return cases
    
    const query = searchQuery.toLowerCase()
    return cases.filter((caseItem) => {
      const barangayName = caseItem.barangay?.name?.toLowerCase() || ''
      const notes = caseItem.notes?.toLowerCase() || ''
      const source = caseItem.source.toLowerCase().replace('_', ' ')
      const status = caseItem.status.toLowerCase()
      
      return (
        barangayName.includes(query) ||
        notes.includes(query) ||
        source.includes(query) ||
        status.includes(query)
      )
    })
  }, [cases, searchQuery])

  const getStatusBadge = (status: string) => {
    return status === 'CONFIRMED' ? 'badge badge-danger' : 'badge badge-warning'
  }

  if (loading) {
    return <div className="text-center py-8">Loading cases...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dengue Cases</h1>
        <Link to="/cases/new" className="btn btn-primary">
          Add New Case
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              placeholder="Search by barangay, notes, source, or status..."
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">All</option>
            <option value="SUSPECTED">Suspected</option>
            <option value="CONFIRMED">Confirmed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="input"
          >
            <option value="">All</option>
            <option value="PUBLIC_HOSPITAL">Public Hospital</option>
            <option value="PRIVATE_HOSPITAL">Private Hospital</option>
            <option value="RHU">RHU</option>
            <option value="BHW">BHW</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Cases Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Reported
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barangay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  {searchQuery ? (
                    <div>
                      <p className="text-gray-500 mb-2">No cases found matching "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : cases.length === 0 ? (
                    <div>
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Found</h3>
                      <p className="text-gray-500 mb-4">Get started by creating your first dengue case report.</p>
                      <Link to="/cases/new" className="btn btn-primary">
                        Add New Case
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500">No cases match the current filters</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(caseItem.dateReported), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {caseItem.barangay?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(caseItem.status)}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {caseItem.source.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      <Link
                        to={`/cases/${caseItem.id}/edit`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, caseId: caseItem.id })}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, caseId: null })}
        onConfirm={handleDelete}
        title="Delete Case"
        message="Are you sure you want to delete this case? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}


