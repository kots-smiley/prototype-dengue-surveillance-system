import { useState } from 'react';
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
} from '../services/emr-program-service';
import { ageFromBirthDate, formatDate, fullName, humanize } from '../utils/formatters';
import { ALLERGY_SEVERITY_OPTIONS } from '../configuration/options';
import { Encounter, Patient } from '../types';

type Tab = 'encounters' | 'conditions' | 'immunizations' | 'maternal' | 'labs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'encounters', label: 'Encounters' },
  { id: 'conditions', label: 'Allergies & Problems' },
  { id: 'immunizations', label: 'Immunizations' },
  { id: 'maternal', label: 'Maternal' },
  { id: 'labs', label: 'Laboratory' },
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

  const patient = data?.data.patient;

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
            <Link to={`/patients/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryItem label="Barangay" value={patient.barangay?.name ?? 'N/A'} />
        <SummaryItem label="Blood type" value={patient.bloodType ?? 'Unknown'} />
        <SummaryItem label="PhilHealth" value={patient.philhealthNo ?? 'N/A'} />
        <SummaryItem label="Contact" value={patient.contactNumber ?? 'N/A'} />
        <SummaryItem label="Civil status" value={patient.civilStatus ? humanize(patient.civilStatus) : 'N/A'} />
        <SummaryItem
          label="Consent"
          value={patient.consentGiven ? 'On file' : 'Pending'}
          tone={patient.consentGiven ? 'success' : 'warning'}
        />
      </div>

      {!patient.consentGiven && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
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
              tab === t.id ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'encounters' && <EncountersTab encounters={patient.encounters ?? []} patientId={id} />}
      {tab === 'conditions' && <ConditionsTab patient={patient} onChange={refetch} />}
      {tab === 'immunizations' && <ImmunizationsTab patient={patient} onChange={refetch} />}
      {tab === 'maternal' && <MaternalTab patient={patient} onChange={refetch} />}
      {tab === 'labs' && <LabsTab patient={patient} onChange={refetch} />}

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
    tone === 'success' ? 'text-green-700' : tone === 'warning' ? 'text-amber-700' : 'text-slate-900';
  return (
    <div className="surface p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function EncountersTab({ encounters, patientId }: { encounters: Encounter[]; patientId: string }) {
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
      {encounters.map((e) => (
        <Card key={e.id} title={`${humanize(e.type)} · ${formatDate(e.encounterDate)}`}>
          <div className="space-y-3 text-sm">
            {e.clinician && (
              <p className="text-xs text-slate-500">
                Clinician: {e.clinician.firstName} {e.clinician.lastName} ({humanize(e.clinician.role)})
              </p>
            )}
            {e.chiefComplaint && (
              <p>
                <span className="font-semibold text-slate-700">Chief complaint:</span> {e.chiefComplaint}
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
                <span className="font-semibold text-slate-700">Diagnoses:</span>
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
                <span className="font-semibold text-slate-700">Assessment:</span> {e.assessment}
              </p>
            )}
            {e.plan && (
              <p>
                <span className="font-semibold text-slate-700">Plan:</span> {e.plan}
              </p>
            )}
            {(e.prescriptions?.length ?? 0) > 0 && (
              <div>
                <span className="font-semibold text-slate-700">Prescriptions:</span>
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
    </div>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {label}: <span className="font-semibold text-slate-900">{value}</span>
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
          <p className="text-sm text-slate-500">No known allergies recorded.</p>
        ) : (
          <ul className="space-y-2">
            {patient.allergies!.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span>
                  {a.substance} {a.severity ? <span className="badge badge-warning ml-2">{humanize(a.severity)}</span> : null}
                </span>
                <button onClick={() => removeAllergy(a.id)} className="text-red-600 hover:text-red-800">
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
              <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
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
  const [value, setValue] = useState('');

  const add = async () => {
    if (!testName.trim()) return;
    try {
      await labService.create({ patientId: patient.id, testName: testName.trim(), value: value.trim() || undefined });
      setTestName('');
      setValue('');
      onChange();
      toast.success('Lab result added');
    } catch {
      toast.error('Failed to add lab result');
    }
  };

  const remove = async (recordId: string) => {
    try {
      await labService.remove(recordId);
      onChange();
    } catch {
      toast.error('Failed to remove result');
    }
  };

  return (
    <Card title="Laboratory results">
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
        <Input placeholder="Test name (e.g. CBC)" value={testName} onChange={(e) => setTestName(e.target.value)} />
        <Input placeholder="Result value" value={value} onChange={(e) => setValue(e.target.value)} />
        <Button onClick={add}>Add</Button>
      </div>
      {(patient.labResults?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">No lab results recorded.</p>
      ) : (
        <ul className="space-y-2">
          {patient.labResults!.map((l) => (
            <li key={l.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>
                {l.testName}: <span className="font-semibold">{l.value ?? '—'}</span> {l.unit ?? ''} · {formatDate(l.resultDate)}
              </span>
              <button onClick={() => remove(l.id)} className="text-red-600 hover:text-red-800">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
