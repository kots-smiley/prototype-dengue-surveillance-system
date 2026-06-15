import { Patient, Referral } from '../../types';
import { formatDate, formatDateTime, fullName, humanize } from '../../utils/formatters';
import { APP_LOCATION, APP_NAME } from '../../configuration/constants';

export function ReferralPrint({
  patient,
  referral,
}: {
  patient: Patient;
  referral: Referral;
}) {
  const referringClinician = referral.fromFacility?.name
    ? `${referral.fromFacility.name}`
    : 'Referring facility';

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
        <h1 className="print-title">Referral Letter</h1>
        <div className="print-meta">
          {formatDateTime(referral.createdAt)}
          <br />
          Priority: {humanize(referral.priority)}
        </div>
      </div>

      <section className="print-section">
        <h2 className="print-section-title">Patient information</h2>
        <div className="print-panel">
          <div className="print-grid">
            <span className="print-label">Patient</span>
            <span className="print-value">
              {fullName(patient)} ({patient.patientCode})
            </span>
            <span className="print-label">Sex</span>
            <span className="print-value">{humanize(patient.sex)}</span>
            <span className="print-label">Date of birth</span>
            <span className="print-value">{formatDate(patient.birthDate)}</span>
            {patient.contactNumber && (
              <>
                <span className="print-label">Contact</span>
                <span className="print-value">{patient.contactNumber}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="print-section">
        <h2 className="print-section-title">Referral details</h2>
        <div className="print-panel">
          <div className="print-grid">
            <span className="print-label">From</span>
            <span className="print-value">{referral.fromFacility?.name ?? '—'}</span>
            <span className="print-label">To</span>
            <span className="print-value">{referral.toFacility?.name ?? '—'}</span>
            <span className="print-label">Status</span>
            <span className="print-value">{humanize(referral.status)}</span>
          </div>
        </div>
      </section>

      <section className="print-section">
        <h2 className="print-section-title">Reason for referral</h2>
        <p className="print-body-text">{referral.reason}</p>
      </section>

      {referral.clinicalSummary && (
        <section className="print-section">
          <h2 className="print-section-title">Clinical summary</h2>
          <p className="print-body-text">{referral.clinicalSummary}</p>
        </section>
      )}

      <footer className="print-signature">
        <div>Referring clinician / authorized signatory</div>
        <div className="print-signature-line" />
        <div style={{ marginTop: '6px', fontSize: '9pt', color: '#64748b' }}>{referringClinician}</div>
      </footer>
    </div>
  );
}
