import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmModal } from '../components/ui/Modal';
import { useApiResource } from '../hooks/useApiResource';
import { patientService } from '../services/patient-service';
import {
  immunizationService,
  maternalService,
  labService,
  allergyService,
  problemService,
  historyService,
} from '../services/emr-program-service';
import { medicationService } from '../services/medication-service';
import { ageFromBirthDate, encoderLabel, formatDate, formatDateTime, fullName, humanize, caseStatusBadge } from '../utils/formatters';
import {
  ALLERGY_SEVERITY_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  REFERRAL_PRIORITY_OPTIONS,
  MEDICAL_HISTORY_CATEGORY_OPTIONS,
} from '../configuration/options';
import { Encounter, Patient, Facility, Referral, Case } from '../types';
import { facilityService } from '../services/facility-service';
import { referralService, consentService, documentService, fhirService } from '../services/ehr-service';
import { encounterService } from '../services/encounter-service';
import { downloadJson } from '../utils/download-json';
import { VitalTrendsChart } from '../components/clinical/VitalTrendsChart';
import { PrintPreviewModal } from '../components/clinical/PrintPreviewModal';
import { PrescriptionPrint } from '../components/clinical/PrescriptionPrint';
import { ReferralPrint } from '../components/clinical/ReferralPrint';
import { TerminologyCombobox } from '../components/clinical/TerminologyCombobox';

type Tab =
  | 'encounters'
  | 'conditions'
  | 'medications'
  | 'history'
  | 'immunizations'
  | 'maternal'
  | 'labs'
  | 'referrals'
  | 'cases'
  | 'consent'
  | 'documents';

const TABS: { id: Tab; label: string }[] = [
  { id: 'encounters', label: 'Encounters' },
  { id: 'conditions', label: 'Allergies & Problems' },
  { id: 'medications', label: 'Medications' },
  { id: 'history', label: 'History' },
  { id: 'immunizations', label: 'Immunizations' },
  { id: 'maternal', label: 'Maternal' },
  { id: 'labs', label: 'Laboratory' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'cases', label: 'Cases' },
  { id: 'consent', label: 'Consent' },
  { id: 'documents', label: 'Documents' },
];

export default function PatientDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('encounters');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const { data, loading, refetch } = useApiResource(
    () => patientService.getById(id),
    [id],
    { errorMessage: 'Failed to load patient' }
  );

  const {
    data: encountersData,
    loading: encountersLoading,
    refetch: refetchEncounters,
  } = useApiResource(
    () => encounterService.list({ patientId: id, limit: 100 }),
    [id],
    { errorMessage: 'Failed to load encounters' }
  );

  const patient = data?.data.patient;
  const encounters = encountersData?.data.items ?? [];

  const refetchAll = () => {
    refetch();
    refetchEncounters();
  };

  const handleArchive = async () => {
    try {
      await patientService.remove(id);
      toast.success('Patient archived');
      navigate('/patients');
    } catch {
      toast.error('Failed to archive patient');
    }
  };

  if (loading) return <Spinner label="Loading patient record..." />;
  if (!patient) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName(patient)}
        subtitle={`${patient.patientCode} · ${ageFromBirthDate(patient.birthDate) ?? '?'} y/o · ${humanize(patient.sex)}`}
        actions={
          <>
            <Link to={`/patients/${id}/encounters/new`}>
              <Button>New Encounter</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const ips = await fhirService.summary(id);
                  downloadJson(ips, `IPS-${patient.patientCode}.json`);
                  toast.success('International Patient Summary exported');
                } catch {
                  toast.error('Failed to export IPS');
                }
              }}
            >
              Export IPS
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const bundle = await fhirService.everything(id);
                  downloadJson(bundle, `FHIR-${patient.patientCode}.json`);
                  toast.success('FHIR bundle exported');
                } catch {
                  toast.error('Failed to export FHIR');
                }
              }}
            >
              Export FHIR
            </Button>
            <Link to={`/patients/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryItem label="Home facility" value={patient.homeFacility?.name ?? 'N/A'} />
        <SummaryItem label="Barangay" value={patient.barangay?.name ?? 'N/A'} />
        <SummaryItem label="Blood type" value={patient.bloodType ?? 'Unknown'} />
        <SummaryItem label="PhilHealth" value={patient.philhealthNo ?? 'N/A'} />
        <SummaryItem label="Contact" value={patient.contactNumber ?? 'N/A'} />
        <SummaryItem label="Civil status" value={patient.civilStatus ? humanize(patient.civilStatus) : 'N/A'} />
        <SummaryItem label="Encoded by" value={encoderLabel(patient.registeredBy)} />
        <SummaryItem
          label="Registered on"
          value={patient.createdAt ? formatDateTime(patient.createdAt) : 'N/A'}
        />
        <SummaryItem
          label="Active meds"
          value={String(patient.medications?.length ?? 0)}
        />
        <SummaryItem
          label="Consent"
          value={patient.consentGiven ? 'On file' : 'Pending'}
          tone={patient.consentGiven ? 'success' : 'warning'}
        />
      </div>

      {(patient.allergies?.length ?? 0) > 0 && (
        <div className="alert-danger">
          <span className="font-semibold">Allergies:</span>{' '}
          {patient.allergies!.map((a) => a.substance).join(', ')}
        </div>
      )}

      {!patient.consentGiven && (
        <div className="alert-warning">
          Data privacy consent is not yet on file. Encounters cannot be recorded until consent is
          granted. Edit the patient to record consent.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'encounters' && (
        <EncountersTab
          encounters={encounters}
          loading={encountersLoading}
          patientId={id}
          patient={patient}
        />
      )}
      {tab === 'conditions' && <ConditionsTab patient={patient} onChange={refetchAll} />}
      {tab === 'medications' && <MedicationsTab patient={patient} onChange={refetchAll} />}
      {tab === 'history' && <HistoryTab patient={patient} onChange={refetchAll} />}
      {tab === 'immunizations' && <ImmunizationsTab patient={patient} onChange={refetchAll} />}
      {tab === 'maternal' && <MaternalTab patient={patient} onChange={refetchAll} />}
      {tab === 'labs' && <LabsTab patient={patient} onChange={refetchAll} />}
      {tab === 'referrals' && <ReferralsTab patient={patient} onChange={refetchAll} />}
      {tab === 'cases' && <CasesTab patient={patient} />}
      {tab === 'consent' && <ConsentTab patient={patient} onChange={refetchAll} />}
      {tab === 'documents' && <DocumentsTab patient={patient} onChange={refetchAll} />}

      <div className="flex justify-end">
        <Button variant="danger" onClick={() => setArchiveOpen(true)}>
          Archive Patient
        </Button>
      </div>

      <ConfirmModal
        isOpen={archiveOpen}
        title="Archive Patient"
        message="Archiving hides the patient from the active registry but preserves their medical record. Continue?"
        confirmText="Archive"
        variant="danger"
        onConfirm={handleArchive}
        onClose={() => setArchiveOpen(false)}
      />
    </div>
  );
}

function CasesTab({ patient }: { patient: Patient }) {
  const cases = (patient.cases ?? []) as Case[];

  if (cases.length === 0) {
    return (
      <EmptyState
        title="No linked surveillance cases"
        description="Cases are created when a notifiable disease is selected at registration or confirmed in an encounter."
      />
    );
  }

  return (
    <Card title="Surveillance cases" subtitle="Auto-generated from this patient's EMR record.">
      <div className="table-shell">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="table-head">
            <tr>
              <th className="table-head-cell">Date</th>
              <th className="table-head-cell">Disease</th>
              <th className="table-head-cell">Barangay</th>
              <th className="table-head-cell">Status</th>
              <th className="table-head-cell">Outcome</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {cases.map((c) => (
              <tr key={c.id}>
                <td className="table-cell whitespace-nowrap">{formatDate(c.dateReported)}</td>
                <td className="table-cell whitespace-nowrap font-medium">{c.disease?.name ?? '—'}</td>
                <td className="table-cell whitespace-nowrap">{c.barangay?.name ?? '—'}</td>
                <td className="table-cell whitespace-nowrap">
                  <span className={caseStatusBadge(c.status)}>{humanize(c.status)}</span>
                </td>
                <td className="table-cell whitespace-nowrap">{humanize(c.outcome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'summary-value-success'
      : tone === 'warning'
        ? 'summary-value-warning'
        : 'summary-value';
  return (
    <div className="surface p-3">
      <p className="text-xs font-medium muted">{label}</p>
      <p className={toneClass}>{value}</p>
    </div>
  );
}

function EncountersTab({
  encounters,
  loading,
  patientId,
  patient,
}: {
  encounters: Encounter[];
  loading: boolean;
  patientId: string;
  patient: Patient;
}) {
  const [printEncounter, setPrintEncounter] = useState<Encounter | null>(null);

  if (loading) return <Spinner label="Loading encounters..." />;

  if (encounters.length === 0) {
    return (
      <Card title="Encounters">
        <EmptyState
          icon="🩺"
          title="No encounters yet"
          description="Record a consultation to start this patient's clinical history."
          action={
            <Link to={`/patients/${patientId}/encounters/new`}>
              <Button>New Encounter</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <VitalTrendsChart encounters={encounters} />
      {encounters.map((e) => (
        <Card
          key={e.id}
          title={`${humanize(e.type)} · ${formatDate(e.encounterDate)}`}
          actions={
            <div className="flex flex-wrap gap-2">
              {(e.prescriptions?.length ?? 0) > 0 && (
                <Button variant="secondary" onClick={() => setPrintEncounter(e)}>
                  Print Rx
                </Button>
              )}
              <Link to={`/patients/${patientId}/encounters/${e.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
            </div>
          }
        >
          <div className="space-y-3 text-sm">
            {(e.facility || e.clinician) && (
              <p className="text-xs muted">
                {e.facility ? `${e.facility.name}` : ''}
                {e.facility && e.clinician ? ' · ' : ''}
                {e.clinician ? `${e.clinician.firstName} ${e.clinician.lastName} (${humanize(e.clinician.role)})` : ''}
              </p>
            )}
            {e.chiefComplaint && (
              <p>
                <span className="field-label">Chief complaint:</span> {e.chiefComplaint}
              </p>
            )}
            {e.vitalSign && (
              <div className="flex flex-wrap gap-2">
                {e.vitalSign.systolic != null && e.vitalSign.diastolic != null && (
                  <Vital label="BP" value={`${e.vitalSign.systolic}/${e.vitalSign.diastolic}`} />
                )}
                {e.vitalSign.temperature != null && <Vital label="Temp" value={`${e.vitalSign.temperature}°C`} />}
                {e.vitalSign.heartRate != null && <Vital label="HR" value={`${e.vitalSign.heartRate}`} />}
                {e.vitalSign.respiratoryRate != null && <Vital label="RR" value={`${e.vitalSign.respiratoryRate}`} />}
                {e.vitalSign.oxygenSat != null && <Vital label="SpO₂" value={`${e.vitalSign.oxygenSat}%`} />}
                {e.vitalSign.bmi != null && <Vital label="BMI" value={`${e.vitalSign.bmi}`} />}
              </div>
            )}
            {(e.diagnoses?.length ?? 0) > 0 && (
              <div>
                <span className="field-label">Diagnoses:</span>
                <ul className="mt-1 space-y-1">
                  {e.diagnoses!.map((d) => (
                    <li key={d.id} className="flex items-center gap-2">
                      <span className={`badge ${d.certainty === 'CONFIRMED' ? 'badge-danger' : 'badge-info'}`}>
                        {humanize(d.certainty)}
                      </span>
                      <span>
                        {d.description}
                        {d.icd10Code ? ` (${d.icd10Code})` : ''}
                        {d.disease?.isNotifiable ? ' · notifiable' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {e.assessment && (
              <p>
                <span className="field-label">Assessment:</span> {e.assessment}
              </p>
            )}
            {e.plan && (
              <p>
                <span className="field-label">Plan:</span> {e.plan}
              </p>
            )}
            {(e.prescriptions?.length ?? 0) > 0 && (
              <div>
                <span className="field-label">Prescriptions:</span>
                <ul className="mt-1 list-inside list-disc">
                  {e.prescriptions!.flatMap((p) =>
                    p.items.map((it, idx) => (
                      <li key={`${p.id}-${idx}`}>
                        {it.drug} {it.dose ?? ''} {it.frequency ? `· ${it.frequency}` : ''}{' '}
                        {it.duration ? `· ${it.duration}` : ''}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>
      ))}
      <PrintPreviewModal
        isOpen={Boolean(printEncounter)}
        title="Prescription"
        onClose={() => setPrintEncounter(null)}
      >
        {printEncounter && <PrescriptionPrint patient={patient} encounter={printEncounter} />}
      </PrintPreviewModal>
    </div>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <span className="vital-chip">
      {label}: <span className="vital-chip-value">{value}</span>
    </span>
  );
}

function ConditionsTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [substance, setSubstance] = useState('');
  const [severity, setSeverity] = useState('');
  const [problemName, setProblemName] = useState('');

  const addAllergy = async () => {
    if (!substance.trim()) return;
    try {
      await allergyService.create({ patientId: patient.id, substance: substance.trim(), severity: severity || undefined });
      setSubstance('');
      setSeverity('');
      onChange();
      toast.success('Allergy added');
    } catch {
      toast.error('Failed to add allergy');
    }
  };

  const addProblem = async () => {
    if (!problemName.trim()) return;
    try {
      await problemService.create({ patientId: patient.id, name: problemName.trim() });
      setProblemName('');
      onChange();
      toast.success('Problem added');
    } catch {
      toast.error('Failed to add problem');
    }
  };

  const removeAllergy = async (allergyId: string) => {
    try {
      await allergyService.remove(allergyId);
      onChange();
    } catch {
      toast.error('Failed to remove allergy');
    }
  };

  const removeProblem = async (problemId: string) => {
    try {
      await problemService.remove(problemId);
      onChange();
    } catch {
      toast.error('Failed to remove problem');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Allergies">
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,auto,auto]">
          <Input placeholder="Substance" value={substance} onChange={(e) => setSubstance(e.target.value)} />
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">Severity</option>
            {ALLERGY_SEVERITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Button onClick={addAllergy}>Add</Button>
        </div>
        {(patient.allergies?.length ?? 0) === 0 ? (
          <p className="text-sm muted">No known allergies recorded.</p>
        ) : (
          <ul className="space-y-2">
            {patient.allergies!.map((a) => (
              <li key={a.id} className="list-row flex items-center justify-between">
                <span>
                  {a.substance} {a.severity ? <span className="badge badge-warning ml-2">{humanize(a.severity)}</span> : null}
                </span>
                <button onClick={() => removeAllergy(a.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Problem list">
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,auto]">
          <Input placeholder="Condition (e.g. Hypertension)" value={problemName} onChange={(e) => setProblemName(e.target.value)} />
          <Button onClick={addProblem}>Add</Button>
        </div>
        {(patient.problems?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">No active problems recorded.</p>
        ) : (
          <ul className="space-y-2">
            {patient.problems!.map((p) => (
              <li key={p.id} className="list-row flex items-center justify-between">
                <span>
                  {p.name} <span className="badge badge-info ml-2">{humanize(p.status)}</span>
                </span>
                <button onClick={() => removeProblem(p.id)} className="text-red-600 hover:text-red-800">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function MedicationsTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [drug, setDrug] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');

  const add = async () => {
    if (!drug.trim()) return;
    try {
      await medicationService.create({
        patientId: patient.id,
        drug: drug.trim(),
        dose: dose.trim() || undefined,
        frequency: frequency.trim() || undefined,
      });
      setDrug('');
      setDose('');
      setFrequency('');
      onChange();
      toast.success('Medication added');
    } catch {
      toast.error('Failed to add medication');
    }
  };

  const discontinue = async (medId: string) => {
    try {
      await medicationService.discontinue(medId);
      onChange();
      toast.success('Medication discontinued');
    } catch {
      toast.error('Failed to discontinue medication');
    }
  };

  const active = patient.medications ?? [];

  return (
    <Card title="Active medications">
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,1fr,auto]">
        <Input placeholder="Drug" value={drug} onChange={(e) => setDrug(e.target.value)} />
        <Input placeholder="Dose" value={dose} onChange={(e) => setDose(e.target.value)} />
        <Input placeholder="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        <Button onClick={add}>Add</Button>
      </div>
      {active.length === 0 ? (
        <p className="text-sm text-slate-500">No active medications on file.</p>
      ) : (
        <ul className="space-y-2">
          {active.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>
                {m.drug} {m.dose ? `· ${m.dose}` : ''} {m.frequency ? `· ${m.frequency}` : ''}
              </span>
              <button onClick={() => discontinue(m.id)} className="text-red-600 hover:text-red-800">
                Discontinue
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function HistoryTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [category, setCategory] = useState('PMH');
  const [description, setDescription] = useState('');

  const add = async () => {
    if (!description.trim()) return;
    try {
      await historyService.create({
        patientId: patient.id,
        category,
        description: description.trim(),
      });
      setDescription('');
      onChange();
      toast.success('History entry added');
    } catch {
      toast.error('Failed to add history entry');
    }
  };

  const remove = async (entryId: string) => {
    try {
      await historyService.remove(entryId);
      onChange();
    } catch {
      toast.error('Failed to remove entry');
    }
  };

  const entries = patient.medicalHistoryEntries ?? [];
  const grouped = MEDICAL_HISTORY_CATEGORY_OPTIONS.map((cat) => ({
    ...cat,
    items: entries.filter((e) => e.category === cat.value),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Add history entry">
        <div className="space-y-3">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {MEDICAL_HISTORY_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Description (e.g. Asthma since childhood)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={add}>Add entry</Button>
        </div>
      </Card>
      {grouped.map((g) => (
        <Card key={g.value} title={g.label}>
          {g.items.length === 0 ? (
            <p className="text-sm text-slate-500">None recorded.</p>
          ) : (
            <ul className="space-y-2">
              {g.items.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span>{e.description}</span>
                  <button onClick={() => remove(e.id)} className="text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}

function ImmunizationsTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [vaccine, setVaccine] = useState('');
  const [dateGiven, setDateGiven] = useState('');

  const add = async () => {
    if (!vaccine.trim() || !dateGiven) {
      toast.error('Vaccine and date are required');
      return;
    }
    try {
      await immunizationService.create({ patientId: patient.id, vaccine: vaccine.trim(), dateGiven });
      setVaccine('');
      setDateGiven('');
      onChange();
      toast.success('Immunization recorded');
    } catch {
      toast.error('Failed to record immunization');
    }
  };

  const remove = async (recordId: string) => {
    try {
      await immunizationService.remove(recordId);
      onChange();
    } catch {
      toast.error('Failed to remove record');
    }
  };

  return (
    <Card title="Immunizations (EPI)">
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
        <Input placeholder="Vaccine" value={vaccine} onChange={(e) => setVaccine(e.target.value)} />
        <Input type="date" value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} />
        <Button onClick={add}>Add</Button>
      </div>
      {(patient.immunizations?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">No immunizations recorded.</p>
      ) : (
        <ul className="space-y-2">
          {patient.immunizations!.map((im) => (
            <li key={im.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>
                {im.vaccine} {im.doseNumber ? `(dose ${im.doseNumber})` : ''} · {formatDate(im.dateGiven)}
              </span>
              <button onClick={() => remove(im.id)} className="text-red-600 hover:text-red-800">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function MaternalTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [lmp, setLmp] = useState('');
  const [prenatalVisit, setPrenatalVisit] = useState('');

  const add = async () => {
    try {
      await maternalService.create({
        patientId: patient.id,
        lmp: lmp || undefined,
        prenatalVisit: prenatalVisit ? Number(prenatalVisit) : undefined,
      });
      setLmp('');
      setPrenatalVisit('');
      onChange();
      toast.success('Prenatal record added');
    } catch {
      toast.error('Failed to add prenatal record');
    }
  };

  const remove = async (recordId: string) => {
    try {
      await maternalService.remove(recordId);
      onChange();
    } catch {
      toast.error('Failed to remove record');
    }
  };

  return (
    <Card title="Maternal / prenatal care">
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
        <Input label="LMP" type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} />
        <Input label="Prenatal visit #" type="number" min={0} value={prenatalVisit} onChange={(e) => setPrenatalVisit(e.target.value)} />
        <div className="flex items-end">
          <Button onClick={add}>Add</Button>
        </div>
      </div>
      {(patient.maternalRecords?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">No maternal records.</p>
      ) : (
        <ul className="space-y-2">
          {patient.maternalRecords!.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>
                Visit {m.prenatalVisit ?? '—'} · {formatDate(m.visitDate)} {m.lmp ? `· LMP ${formatDate(m.lmp)}` : ''}
              </span>
              <button onClick={() => remove(m.id)} className="text-red-600 hover:text-red-800">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function LabsTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [testName, setTestName] = useState('');
  const [loincCode, setLoincCode] = useState('');
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [resultUnit, setResultUnit] = useState('');

  const pending = (patient.labResults ?? []).filter((l) => l.status === 'ORDERED');
  const resulted = (patient.labResults ?? []).filter((l) => l.status !== 'ORDERED');

  const orderLab = async () => {
    if (!testName.trim()) return;
    try {
      await labService.create({
        patientId: patient.id,
        testName: testName.trim(),
        loincCode: loincCode || undefined,
        status: 'ORDERED',
      });
      setTestName('');
      setLoincCode('');
      onChange();
      toast.success('Lab order placed');
    } catch {
      toast.error('Failed to order lab');
    }
  };

  const enterResult = async () => {
    if (!resultId || !resultValue.trim()) return;
    try {
      await labService.update(resultId, {
        status: 'RESULTED',
        value: resultValue.trim(),
        unit: resultUnit.trim() || undefined,
      });
      setResultId(null);
      setResultValue('');
      setResultUnit('');
      onChange();
      toast.success('Result recorded');
    } catch {
      toast.error('Failed to record result');
    }
  };

  const cancelOrder = async (labId: string) => {
    try {
      await labService.cancel(labId);
      onChange();
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Order lab test">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,1fr,auto]">
          <TerminologyCombobox
            label="Test (LOINC search)"
            system="LOINC"
            value={loincCode}
            displayValue={testName ? `${loincCode ? loincCode + ' — ' : ''}${testName}` : ''}
            onSelect={(c) => {
              setLoincCode(c.code);
              setTestName(c.display);
            }}
            onClear={() => {
              setLoincCode('');
              setTestName('');
            }}
          />
          <Input
            label="Test name"
            placeholder="Or type manually"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={orderLab}>Order</Button>
          </div>
        </div>
      </Card>

      <Card title="Pending orders">
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending lab orders.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <span>
                  {l.testName} {l.loincCode ? `(${l.loincCode})` : ''} · ordered {formatDate(l.orderedAt ?? l.createdAt)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setResultId(l.id);
                      setResultValue('');
                      setResultUnit('');
                    }}
                  >
                    Enter result
                  </Button>
                  <button onClick={() => cancelOrder(l.id)} className="text-sm text-red-600 hover:text-red-800">
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {resultId && (
          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-200 pt-4 sm:grid-cols-[1fr,1fr,auto]">
            <Input placeholder="Result value" value={resultValue} onChange={(e) => setResultValue(e.target.value)} />
            <Input placeholder="Unit" value={resultUnit} onChange={(e) => setResultUnit(e.target.value)} />
            <Button onClick={enterResult}>Save result</Button>
          </div>
        )}
      </Card>

      <Card title="Results">
        {resulted.length === 0 ? (
          <p className="text-sm text-slate-500">No lab results recorded.</p>
        ) : (
          <ul className="space-y-2">
            {resulted.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span>
                  {l.testName}: <span className="font-semibold">{l.value ?? '—'}</span> {l.unit ?? ''} ·{' '}
                  {formatDate(l.resultDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ReferralsTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [toFacilityId, setToFacilityId] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('ROUTINE');
  const [printReferral, setPrintReferral] = useState<Referral | null>(null);

  useEffect(() => {
    facilityService
      .list({ isActive: 'true' })
      .then((res) => setFacilities(res.data.facilities))
      .catch(() => undefined);
  }, []);

  const create = async () => {
    if (!toFacilityId || !reason.trim()) {
      toast.error('Receiving facility and reason are required');
      return;
    }
    try {
      await referralService.create({ patientId: patient.id, toFacilityId, reason: reason.trim(), priority });
      setToFacilityId('');
      setReason('');
      onChange();
      toast.success('Referral created');
    } catch {
      toast.error('Failed to create referral');
    }
  };

  return (
    <Card title="Referrals" subtitle="Refer this patient to another facility (continuity of care).">
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto,auto]">
        <Select value={toFacilityId} onChange={(e) => setToFacilityId(e.target.value)}>
          <option value="">Receiving facility…</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
        <Input placeholder="Reason for referral" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {REFERRAL_PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Button onClick={create}>Refer</Button>
      </div>
      {(patient.referrals?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No referrals for this patient.</p>
      ) : (
        <ul className="space-y-2">
          {patient.referrals!.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span>
                {r.fromFacility?.name ?? '—'} → {r.toFacility?.name ?? '—'} ·{' '}
                <span className={`badge ${r.status === 'COMPLETED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-info'}`}>
                  {humanize(r.status)}
                </span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{r.reason}</span>
              </span>
              <Button variant="secondary" onClick={() => setPrintReferral(r)}>
                Print
              </Button>
            </li>
          ))}
        </ul>
      )}
      <PrintPreviewModal
        isOpen={Boolean(printReferral)}
        title="Referral Letter"
        onClose={() => setPrintReferral(null)}
      >
        {printReferral && <ReferralPrint patient={patient} referral={printReferral} />}
      </PrintPreviewModal>
    </Card>
  );
}

function ConsentTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const grant = async () => {
    try {
      await consentService.create({ patientId: patient.id, purpose: 'TREATMENT', scope: 'SUMMARY' });
      onChange();
      toast.success('Consent recorded for all network facilities');
    } catch {
      toast.error('Failed to record consent');
    }
  };

  const revoke = async (consentId: string) => {
    try {
      await consentService.revoke(consentId);
      onChange();
    } catch {
      toast.error('Failed to revoke consent');
    }
  };

  return (
    <Card
      title="Sharing consent"
      subtitle="Consent directives govern cross-facility access in the HIE (ISO 22600 / RA 10173)."
      actions={<Button onClick={grant}>Grant (all facilities)</Button>}
    >
      {(patient.consents?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No sharing consent on file. Other facilities cannot view this record except via audited break-glass.
        </p>
      ) : (
        <ul className="space-y-2">
          {patient.consents!.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span>
                {c.grantedToFacility?.name ?? 'All facilities'} · {humanize(c.purpose)} · {humanize(c.scope)} ·{' '}
                <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{humanize(c.status)}</span>
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
  );
}

function DocumentsTab({ patient, onChange }: { patient: Patient; onChange: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('OTHER');
  const [content, setContent] = useState('');

  const add = async () => {
    if (!title.trim()) return;
    try {
      await documentService.create({ patientId: patient.id, title: title.trim(), type, content: content.trim() || undefined });
      setTitle('');
      setContent('');
      onChange();
      toast.success('Document added');
    } catch {
      toast.error('Failed to add document');
    }
  };

  const remove = async (docId: string) => {
    try {
      await documentService.remove(docId);
      onChange();
    } catch {
      toast.error('Failed to remove document');
    }
  };

  return (
    <Card title="Clinical documents">
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,1fr,auto]">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          {DOCUMENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Input placeholder="Notes / content" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button onClick={add}>Add</Button>
      </div>
      {(patient.documents?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No documents on file.</p>
      ) : (
        <ul className="space-y-2">
          {patient.documents!.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span>
                <span className="font-semibold">{d.title}</span> · {humanize(d.type)} · {formatDate(d.createdAt)}
              </span>
              <button onClick={() => remove(d.id)} className="text-red-600 hover:text-red-800">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
