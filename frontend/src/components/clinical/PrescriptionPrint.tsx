import { Encounter, Patient } from '../../types';
import { formatDate, fullName, humanize } from '../../utils/formatters';

export function PrescriptionPrint({
  patient,
  encounter,
}: {
  patient: Patient;
  encounter: Encounter;
}) {
  const items = encounter.prescriptions?.flatMap((p) => p.items) ?? [];
  const clinician = encounter.clinician
    ? `${encounter.clinician.firstName} ${encounter.clinician.lastName}`
    : 'Attending physician';

  return (
    <div>
      <h1>Prescription</h1>
      <div className="meta">
        {encounter.facility?.name ?? 'Health facility'} · {formatDate(encounter.encounterDate)}
      </div>
      <p>
        <strong>Patient:</strong> {fullName(patient)} ({patient.patientCode})
      </p>
      <p>
        <strong>Age/Sex:</strong> {patient.birthDate ? formatDate(patient.birthDate) : '—'} ·{' '}
        {humanize(patient.sex)}
      </p>
      {encounter.chiefComplaint && (
        <p>
          <strong>Chief complaint:</strong> {encounter.chiefComplaint}
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Drug</th>
            <th>Dose</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td>{it.drug}</td>
              <td>{it.dose ?? '—'}</td>
              <td>{it.frequency ?? '—'}</td>
              <td>{it.duration ?? '—'}</td>
              <td>{it.instructions ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sig">Prescriber: {clinician}</div>
    </div>
  );
}
