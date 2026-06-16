import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { patientService } from '../services/patient-service';
import { hieService, SharedRecord } from '../services/ehr-service';
import { ApiError } from '../utils/api-client';
import { ageFromBirthDate, formatDate, fullName, humanize } from '../utils/formatters';
import { CONSENT_PURPOSE_OPTIONS } from '../configuration/options';
import { Patient } from '../types';

export default function HealthExchange() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [purpose, setPurpose] = useState('TREATMENT');
  const [breakGlass, setBreakGlass] = useState(false);
  const [record, setRecord] = useState<SharedRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const runSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await patientService.list({ search: search.trim(), limit: 10 });
      setResults(res.data.items);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const accessRecord = async (patient: Patient) => {
    setSelected(patient);
    setRecord(null);
    setLoadingRecord(true);
    try {
      const res = await hieService.getRecord(patient.id, {
        purpose,
        breakGlass: breakGlass ? 'true' : undefined,
      });
      setRecord(res.data);
      toast.success(res.data.breakGlass ? 'Break-glass access recorded' : 'Consent verified — access granted');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Access denied';
      toast.error(message);
    } finally {
      setLoadingRecord(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Information Exchange"
        subtitle="Consent-governed cross-facility record access (every access is audited)"
      />

      <Card title="1) Find a patient" subtitle="Search the municipality-wide patient index.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Input
              label="Search"
              placeholder="Name, patient code, or PhilHealth no."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            />
          </div>
          <Button onClick={runSearch} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
              >
                <span>
                  {fullName(p)} · <span className="font-mono text-xs">{p.patientCode}</span> ·{' '}
                  {ageFromBirthDate(p.birthDate) ?? '?'} y/o
                </span>
                <Button variant="secondary" onClick={() => setSelected(p)}>
                  Select
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selected && (
        <Card title={`2) Request record — ${fullName(selected)}`} subtitle="State the purpose of use. Emergency access is break-glass and audited.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select label="Purpose of use" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {CONSENT_PURPOSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <label className="flex items-end gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={breakGlass}
                onChange={(e) => setBreakGlass(e.target.checked)}
              />
              Break-glass (emergency override)
            </label>
            <div className="flex items-end">
              <Button onClick={() => accessRecord(selected)} disabled={loadingRecord}>
                {loadingRecord ? 'Requesting...' : 'Access Record'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loadingRecord && <Spinner label="Retrieving shared record..." />}

      {record && selected && (
        <Card
          title="3) Shared record"
          subtitle={`Purpose: ${humanize(record.purpose)}${record.breakGlass ? ' · BREAK-GLASS' : ''}`}
        >
          {record.timeline.length === 0 ? (
            <EmptyState icon="🗂️" title="No cross-facility encounters" />
          ) : (
            <ol className="relative space-y-4 border-l border-slate-200 pl-5 dark:border-slate-800">
              {record.timeline.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[1.45rem] top-1 h-3 w-3 rounded-full bg-primary-500" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {humanize(e.type)} · {formatDate(e.encounterDate)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {e.facility?.name ?? 'Unknown facility'}
                    {e.clinician ? ` · ${e.clinician.firstName} ${e.clinician.lastName}` : ''}
                  </p>
                  {(e.diagnoses?.length ?? 0) > 0 && (
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {e.diagnoses!.map((d) => d.description).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}
    </div>
  );
}
