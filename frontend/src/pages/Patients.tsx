import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Input } from '../components/ui/Input';
import { useApiResource } from '../hooks/useApiResource';
import { patientService } from '../services/patient-service';
import { ageFromBirthDate, fullName, humanize } from '../utils/formatters';
import { DEFAULT_PAGE_SIZE } from '../configuration/constants';

export default function Patients() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');

  const { data, loading, refreshing } = useApiResource(
    () => patientService.list({ page, limit, search: search || undefined, isActive: 'true' }),
    [page, limit, search],
    { errorMessage: 'Failed to load patients' }
  );

  const patients = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle="Master patient index for the Rural Health Unit"
        actions={
          <Link to="/patients/new">
            <Button>Register Patient</Button>
          </Link>
        }
      />

      <Card title="Find a patient" subtitle="Search by name or patient ID.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            placeholder="Name or patient code"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </Card>

      <Card title="Patient registry" subtitle="Records are confidential and access is audited.">
        {refreshing && <p className="mb-3 text-xs font-medium text-slate-500">Refreshing records...</p>}
        {loading ? (
          <Spinner label="Loading patients..." />
        ) : patients.length === 0 ? (
          <EmptyState
            icon="🧑‍⚕️"
            title="No patients found"
            description="Register your first patient to start building their medical record."
            action={
              <Link to="/patients/new">
                <Button>Register Patient</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="table-shell">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="table-head">
                  <tr>
                    <th className="table-head-cell">Patient ID</th>
                    <th className="table-head-cell">Name</th>
                    <th className="table-head-cell">Age</th>
                    <th className="table-head-cell">Sex</th>
                    <th className="table-head-cell">Barangay</th>
                    <th className="table-head-cell">Consent</th>
                    <th className="table-head-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {patients.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50">
                      <td className="table-cell whitespace-nowrap font-mono text-xs font-semibold text-primary-700">
                        {p.patientCode}
                      </td>
                      <td className="table-cell whitespace-nowrap font-semibold text-slate-900">
                        {fullName(p)}
                      </td>
                      <td className="table-cell whitespace-nowrap">{ageFromBirthDate(p.birthDate) ?? 'N/A'}</td>
                      <td className="table-cell whitespace-nowrap">{humanize(p.sex)}</td>
                      <td className="table-cell whitespace-nowrap">{p.barangay?.name ?? 'N/A'}</td>
                      <td className="table-cell whitespace-nowrap">
                        <span className={`badge ${p.consentGiven ? 'badge-success' : 'badge-warning'}`}>
                          {p.consentGiven ? 'On file' : 'Pending'}
                        </span>
                      </td>
                      <td className="table-cell whitespace-nowrap">
                        <div className="flex gap-3">
                          <Link to={`/patients/${p.id}`} className="text-primary-600 hover:text-primary-800">
                            View
                          </Link>
                          <Link to={`/patients/${p.id}/edit`} className="text-slate-600 hover:text-slate-900">
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
