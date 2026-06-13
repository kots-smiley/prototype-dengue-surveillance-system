import { Patient, Referral } from '../../types';
import { formatDate, fullName, humanize } from '../../utils/formatters';
import { BrandLogo } from '../common/BrandLogo';

export function ReferralPrint({
  patient,
  referral,
}: {
  patient: Patient;
  referral: Referral;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <BrandLogo size="md" showText />
      </div>
      <h1>Referral Letter</h1>
      <div className="meta">{formatDate(referral.createdAt)} · Priority: {humanize(referral.priority)}</div>
      <p>
        <strong>Patient:</strong> {fullName(patient)} ({patient.patientCode})
      </p>
      <p>
        <strong>From:</strong> {referral.fromFacility?.name ?? '—'}
      </p>
      <p>
        <strong>To:</strong> {referral.toFacility?.name ?? '—'}
      </p>
      <p>
        <strong>Reason for referral:</strong> {referral.reason}
      </p>
      {referral.clinicalSummary && (
        <p>
          <strong>Clinical summary:</strong> {referral.clinicalSummary}
        </p>
      )}
      <div className="sig">Referring clinician signature</div>
    </div>
  );
}
