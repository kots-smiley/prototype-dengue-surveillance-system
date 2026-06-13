import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useApiResource } from '../hooks/useApiResource';
import { portalService } from '../services/portal-service';
import { ageFromBirthDate, formatDate, humanize } from '../utils/formatters';

export default function Portal() {
  const { data, loading } = useApiResource(() => portalService.myRecord(), [], {
    errorMessage: 'Failed to load your record',
  });
  const {
    data: consentData,
    loading: consentsLoading,
    refetch: refetchConsents,
  } = useApiResource(() => portalService.myConsents(), [], { errorMessage: 'Failed to load consents' });

  const [granting, setGranting] = useState(false);

  const patient = data?.data.patient;
  const consents = consentData?.data.consents ?? [];

  const grantAll = async () => {
    setGranting(true);
    try {
      await portalService.createConsent({ purpose: 'TREATMENT', scope: 'SUMMARY' });
      toast.success('Consent granted to all network facilities');
      refetchConsents();
    } catch {
      toast.error('Failed to grant consent');
    } finally {
      setGranting(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await portalService.revokeConsent(id);
      toast.success('Consent revoked');
      refetchConsents();
    } catch {
      toast.error('Failed to revoke consent');
    }
  };

  if (loading) return <Spinner label="Loading your health record..." />;
  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Health Record" subtitle="Patient portal" />
        <EmptyState icon="🔒" title="No linked record" description="Your account is not yet linked to a patient record. Contact your RHU." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Health Record"
        subtitle={`${patient.patientCode} · ${ageFromBirthDate(patient.birthDate) ?? '?'} y/o · ${humanize(patient.sex)}`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Allergies">
          {(patient.allergies?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No known allergies recorded.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.allergies!.map((a) => (
                <li key={a.id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  {a.substance} {a.severity ? `(${humanize(a.severity)})` : ''}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Active problems">
          {(patient.problems?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No active problems on record.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.problems!.map((p) => (
                <li key={p.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Active medications">
          {(patient.medications?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No active medications on record.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.medications!.map((m) => (
                <li key={m.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  {m.drug} {m.dose ? `· ${m.dose}` : ''} {m.frequency ? `· ${m.frequency}` : ''}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent visits">
          {(patient.encounters?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No visits on record.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.encounters!.map((e) => (
                <li key={e.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  {humanize(e.type)} · {formatDate(e.encounterDate)}
                  {e.chiefComplaint ? ` · ${e.chiefComplaint}` : ''}
                  {e.diagnoses?.[0] ? ` · ${e.diagnoses[0].description}` : ''}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Immunizations">
          {(patient.immunizations?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No immunizations on record.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.immunizations!.map((im) => (
                <li key={im.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  {im.vaccine} · {formatDate(im.dateGiven)}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent lab results">
          {(patient.labResults?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No lab results on record.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {patient.labResults!.map((l) => (
                <li key={l.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  {l.testName}: <span className="font-semibold">{l.value ?? '—'}</span> {l.unit ?? ''} ·{' '}
                  {formatDate(l.resultDate)}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Sharing consent"
        subtitle="Control whether facilities in the municipality can view your record."
        actions={
          <Button onClick={grantAll} disabled={granting}>
            {granting ? 'Saving...' : 'Allow all facilities'}
          </Button>
        }
      >
        {consentsLoading ? (
          <Spinner label="Loading consents..." />
        ) : consents.length === 0 ? (
          <p className="text-sm text-slate-500">
            No active sharing consent. Facilities cannot view your record across the network until you allow it.
          </p>
        ) : (
          <ul className="space-y-2">
            {consents.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span>
                  {c.grantedToFacility?.name ?? 'All facilities'} · {humanize(c.purpose)} ·{' '}
                  <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                    {humanize(c.status)}
                  </span>
                </span>
                {c.status === 'ACTIVE' && (
                  <button onClick={() => revoke(c.id)} className="text-red-600 hover:text-red-800">
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
