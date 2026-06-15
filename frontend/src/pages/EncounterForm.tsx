import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Spinner } from '../components/ui/Spinner';
import { Checkbox } from '../components/ui/Checkbox';
import { TerminologyCombobox } from '../components/clinical/TerminologyCombobox';
import { patientService } from '../services/patient-service';
import { diseaseService } from '../services/disease-service';
import { encounterService } from '../services/encounter-service';
import { Disease, Patient } from '../types';
import { ApiError } from '../utils/api-client';
import { fullName, humanize, toDateInputValue } from '../utils/formatters';
import { findAllergyConflicts } from '../utils/allergy-check';
import {
  ENCOUNTER_TYPE_OPTIONS,
  DIAGNOSIS_CERTAINTY_OPTIONS,
  ICD10_REFERENCE,
} from '../configuration/options';

interface EncounterFormData {
  type: string;
  encounterDate: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  systolic: string;
  diastolic: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  weight: string;
  height: string;
  oxygenSat: string;
  diagnoses: {
    icd10Code: string;
    description: string;
    certainty: string;
    isPrimary: boolean;
    diseaseCode: string;
  }[];
  medications: {
    drug: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}

const numeric = (v: string): number | undefined => {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export default function EncounterForm() {
  const { id = '', encounterId } = useParams();
  const isEdit = Boolean(encounterId);
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allergyAcknowledged, setAllergyAcknowledged] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset } = useForm<EncounterFormData>({
    defaultValues: {
      type: 'CONSULT',
      encounterDate: new Date().toISOString().split('T')[0],
      chiefComplaint: '',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      systolic: '',
      diastolic: '',
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      weight: '',
      height: '',
      oxygenSat: '',
      diagnoses: [],
      medications: [],
    },
  });

  const diagnoses = useFieldArray({ control, name: 'diagnoses' });
  const medications = useFieldArray({ control, name: 'medications' });
  const watchedMeds = watch('medications');

  const diseaseByCode = useMemo(() => {
    const map = new Map<string, string>();
    diseases.forEach((d) => map.set(d.code, d.id));
    return map;
  }, [diseases]);

  const allergyConflicts = useMemo(
    () => findAllergyConflicts(watchedMeds?.map((m) => m.drug) ?? [], patient?.allergies),
    [watchedMeds, patient?.allergies]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [patientRes, diseasesRes] = await Promise.all([
          patientService.getById(id),
          diseaseService.list({ isActive: 'true' }),
        ]);
        setPatient(patientRes.data.patient);
        setDiseases(diseasesRes.data.diseases);

        if (encounterId) {
          const encRes = await encounterService.getById(encounterId);
          const e = encRes.data.encounter;
          reset({
            type: e.type,
            encounterDate: toDateInputValue(e.encounterDate),
            chiefComplaint: e.chiefComplaint ?? '',
            subjective: e.subjective ?? '',
            objective: e.objective ?? '',
            assessment: e.assessment ?? '',
            plan: e.plan ?? '',
            systolic: e.vitalSign?.systolic?.toString() ?? '',
            diastolic: e.vitalSign?.diastolic?.toString() ?? '',
            temperature: e.vitalSign?.temperature?.toString() ?? '',
            heartRate: e.vitalSign?.heartRate?.toString() ?? '',
            respiratoryRate: e.vitalSign?.respiratoryRate?.toString() ?? '',
            weight: e.vitalSign?.weight?.toString() ?? '',
            height: e.vitalSign?.height?.toString() ?? '',
            oxygenSat: e.vitalSign?.oxygenSat?.toString() ?? '',
            diagnoses:
              e.diagnoses?.map((d) => ({
                icd10Code: d.icd10Code ?? '',
                description: d.description,
                certainty: d.certainty,
                isPrimary: d.isPrimary,
                diseaseCode: d.disease?.code ?? '',
              })) ?? [],
            medications:
              e.prescriptions?.flatMap((p) =>
                p.items.map((it) => ({
                  drug: it.drug,
                  dose: it.dose ?? '',
                  frequency: it.frequency ?? '',
                  duration: it.duration ?? '',
                  instructions: it.instructions ?? '',
                }))
              ) ?? [],
          });
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load encounter form');
        navigate(`/patients/${id}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, encounterId, navigate, reset]);

  const applyIcd10 = (index: number, code: string, description: string, diseaseCode?: string) => {
    setValue(`diagnoses.${index}.icd10Code`, code);
    setValue(`diagnoses.${index}.description`, description);
    setValue(`diagnoses.${index}.diseaseCode`, diseaseCode ?? '');
  };

  const buildPayload = (data: EncounterFormData) => {
    const vitalSign = {
      systolic: numeric(data.systolic),
      diastolic: numeric(data.diastolic),
      temperature: numeric(data.temperature),
      heartRate: numeric(data.heartRate),
      respiratoryRate: numeric(data.respiratoryRate),
      weight: numeric(data.weight),
      height: numeric(data.height),
      oxygenSat: numeric(data.oxygenSat),
    };
    const hasVitals = Object.values(vitalSign).some((v) => v !== undefined);

    const diagnosesPayload = data.diagnoses
      .filter((d) => d.description.trim())
      .map((d) => ({
        description: d.description.trim(),
        icd10Code: d.icd10Code || undefined,
        certainty: d.certainty || 'CONFIRMED',
        isPrimary: d.isPrimary,
        diseaseId: d.diseaseCode ? diseaseByCode.get(d.diseaseCode) : undefined,
      }));

    const items = data.medications
      .filter((m) => m.drug.trim())
      .map((m) => ({
        drug: m.drug.trim(),
        dose: m.dose.trim() || undefined,
        frequency: m.frequency.trim() || undefined,
        duration: m.duration.trim() || undefined,
        instructions: m.instructions.trim() || undefined,
      }));

    return {
      type: data.type,
      encounterDate: data.encounterDate || undefined,
      chiefComplaint: data.chiefComplaint.trim() || undefined,
      subjective: data.subjective.trim() || undefined,
      objective: data.objective.trim() || undefined,
      assessment: data.assessment.trim() || undefined,
      plan: data.plan.trim() || undefined,
      vitalSign: hasVitals ? vitalSign : undefined,
      diagnoses: diagnosesPayload,
      prescriptions: items.length > 0 ? [{ items }] : [],
    };
  };

  const onSubmit = async (data: EncounterFormData) => {
    if (allergyConflicts.length > 0 && !allergyAcknowledged) {
      toast.error('Acknowledge allergy warnings before saving');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(data);
      if (isEdit && encounterId) {
        await encounterService.update(encounterId, payload);
        toast.success('Encounter amended');
      } else {
        await encounterService.create({ patientId: id, ...payload });
        toast.success('Encounter recorded');
      }
      navigate(`/patients/${id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save encounter');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading encounter form..." />;
  if (!patient) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Encounter' : 'New Encounter'}
        subtitle={`${fullName(patient)} · ${patient.patientCode}`}
      />

      {(patient.allergies?.length ?? 0) > 0 && (
        <div className="alert-danger">
          <p className="text-sm font-semibold">Known allergies — review before prescribing</p>
          <ul className="mt-2 space-y-1 text-sm">
            {patient.allergies!.map((a) => (
              <li key={a.id}>
                {a.substance}
                {a.severity ? ` (${humanize(a.severity)})` : ''}
                {a.reaction ? ` — ${a.reaction}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card title="1) Visit details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select label="Encounter type *" {...register('type')}>
              {ENCOUNTER_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Input label="Date *" type="date" {...register('encounterDate')} />
          </div>
          <Input label="Chief complaint" {...register('chiefComplaint')} />
        </Card>

        <Card title="2) Vital signs" subtitle="BMI is computed automatically from weight and height.">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Input label="Systolic (mmHg)" type="number" {...register('systolic')} />
            <Input label="Diastolic (mmHg)" type="number" {...register('diastolic')} />
            <Input label="Temp (°C)" type="number" step="0.1" {...register('temperature')} />
            <Input label="Heart rate (bpm)" type="number" {...register('heartRate')} />
            <Input label="Resp. rate" type="number" {...register('respiratoryRate')} />
            <Input label="Weight (kg)" type="number" step="0.1" {...register('weight')} />
            <Input label="Height (cm)" type="number" step="0.1" {...register('height')} />
            <Input label="SpO₂ (%)" type="number" {...register('oxygenSat')} />
          </div>
        </Card>

        <Card title="3) SOAP notes">
          <div className="space-y-4">
            <Textarea label="Subjective" rows={2} {...register('subjective')} />
            <Textarea label="Objective" rows={2} {...register('objective')} />
            <Textarea label="Assessment" rows={2} {...register('assessment')} />
            <Textarea label="Plan" rows={2} {...register('plan')} />
          </div>
        </Card>

        <Card
          title="4) Diagnoses"
          subtitle="Search ICD-10 or pick a notifiable disease quick-reference."
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                diagnoses.append({
                  icd10Code: '',
                  description: '',
                  certainty: 'CONFIRMED',
                  isPrimary: diagnoses.fields.length === 0,
                  diseaseCode: '',
                })
              }
            >
              Add diagnosis
            </Button>
          }
        >
          {diagnoses.fields.length === 0 ? (
            <p className="text-sm text-slate-500">No diagnoses added yet.</p>
          ) : (
            <div className="space-y-4">
              {diagnoses.fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <TerminologyCombobox
                      label="ICD-10 search"
                      system="ICD10"
                      value={watch(`diagnoses.${index}.icd10Code`)}
                      displayValue={
                        watch(`diagnoses.${index}.icd10Code`)
                          ? `${watch(`diagnoses.${index}.icd10Code`)} — ${watch(`diagnoses.${index}.description`)}`
                          : ''
                      }
                      onSelect={(c) =>
                        applyIcd10(index, c.code, c.display, c.diseaseCode ?? undefined)
                      }
                      onClear={() => {
                        setValue(`diagnoses.${index}.icd10Code`, '');
                        setValue(`diagnoses.${index}.diseaseCode`, '');
                      }}
                    />
                    <Select label="Quick pick (notifiable)" defaultValue="" onChange={(e) => {
                      const entry = ICD10_REFERENCE.find((x) => x.code === e.target.value);
                      if (entry) applyIcd10(index, entry.code, entry.description, entry.diseaseCode);
                    }}>
                      <option value="">Notifiable quick pick…</option>
                      {ICD10_REFERENCE.filter((e) => e.diseaseCode).map((e) => (
                        <option key={e.code} value={e.code}>
                          {e.code} — {e.description}
                        </option>
                      ))}
                    </Select>
                    <Select label="Certainty" {...register(`diagnoses.${index}.certainty`)}>
                      {DIAGNOSIS_CERTAINTY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="mt-3">
                    <Input label="Diagnosis *" {...register(`diagnoses.${index}.description`)} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="checkbox" className="h-4 w-4" {...register(`diagnoses.${index}.isPrimary`)} />
                      Primary diagnosis
                    </label>
                    {watch(`diagnoses.${index}.diseaseCode`) && (
                      <span className="badge badge-info">Linked to surveillance</span>
                    )}
                    <button
                      type="button"
                      onClick={() => diagnoses.remove(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="5) Prescription"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                medications.append({ drug: '', dose: '', frequency: '', duration: '', instructions: '' })
              }
            >
              Add medication
            </Button>
          }
        >
          {medications.fields.length === 0 ? (
            <p className="text-sm text-slate-500">No medications added.</p>
          ) : (
            <div className="space-y-4">
              {medications.fields.map((field, index) => {
                const rowConflicts = findAllergyConflicts(
                  [watch(`medications.${index}.drug`)],
                  patient.allergies
                );
                return (
                  <div
                    key={field.id}
                    className={`rounded-xl border p-4 ${rowConflicts.length ? 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40' : 'border-slate-200 dark:border-slate-700 dark:bg-slate-900/40'}`}
                  >
                    {rowConflicts.length > 0 && (
                      <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                        Allergy warning: {rowConflicts.map((c) => c.allergy.substance).join(', ')}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input label="Drug *" {...register(`medications.${index}.drug`)} />
                      <Input label="Dose" {...register(`medications.${index}.dose`)} />
                      <Input label="Frequency" {...register(`medications.${index}.frequency`)} />
                      <Input label="Duration" {...register(`medications.${index}.duration`)} />
                    </div>
                    <div className="mt-3">
                      <Input label="Instructions" {...register(`medications.${index}.instructions`)} />
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={() => medications.remove(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {allergyConflicts.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/40">
              <Checkbox
                label="I acknowledge the allergy warnings and wish to proceed with this prescription"
                checked={allergyAcknowledged}
                onChange={(e) => setAllergyAcknowledged(e.target.checked)}
              />
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Encounter'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/patients/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
