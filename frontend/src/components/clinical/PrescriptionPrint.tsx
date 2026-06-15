import { Encounter, Patient } from '../../types';
import { formatDate, fullName, humanize } from '../../utils/formatters';
import { APP_LOCATION, APP_NAME } from '../../configuration/constants';

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
    <div className="print-doc">
      <header className="print-header">
        <img
          src="/lopez-seal.png"
          alt=""
          className="print-logo"
          width={48}
          height={48}
        />
        <div>
          <p className="print-org-name">{APP_NAME}</p>
          <p className="print-org-location">{APP_LOCATION}</p>
        </div>
      </header>

      <div className="print-title-row">
        <h1 className="print-title">Prescription</h1>
        <div className="print-meta">
          {encounter.facility?.name ?? 'Health facility'}
          <br />
          {formatDate(encounter.encounterDate)}
        </div>
      </div>

      <section className="print-section">
        <div className="print-panel">
          <div className="print-grid">
            <span className="print-label">Patient</span>
            <span className="print-value">
              {fullName(patient)} ({patient.patientCode})
            </span>
            <span className="print-label">Age / Sex</span>
            <span className="print-value">
              {patient.birthDate ? formatDate(patient.birthDate) : '—'} · {humanize(patient.sex)}
            </span>
            {encounter.chiefComplaint && (
              <>
                <span className="print-label">Chief complaint</span>
                <span className="print-value">{encounter.chiefComplaint}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <table className="print-table">
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

      <footer className="print-signature">
        <div>Prescriber: {clinician}</div>
        <div className="print-signature-line" />
      </footer>
    </div>
  );
}
