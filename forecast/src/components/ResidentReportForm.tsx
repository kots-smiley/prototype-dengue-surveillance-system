import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../services/api';
import {
  EMPTY_FACTORS,
  FactorState,
  RISK_CATEGORY_OPTIONS,
  RISK_FACTORS_BY_CATEGORY,
  RiskFactorKey,
} from '../configuration/risk-factors';

interface PublicBarangay {
  id: string;
  name: string;
  municipality: string;
  province: string;
}

export function ResidentReportForm() {
  const [open, setOpen] = useState(false);
  const [barangays, setBarangays] = useState<PublicBarangay[]>([]);
  const [barangayId, setBarangayId] = useState('');
  const [category, setCategory] = useState('VECTOR_BORNE');
  const [factors, setFactors] = useState<FactorState>({ ...EMPTY_FACTORS });
  const [notes, setNotes] = useState('');
  const [submittedByName, setSubmittedByName] = useState('');
  const [submittedByContact, setSubmittedByContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiGet<{ barangays: PublicBarangay[] }>('/public/barangays')
      .then((data) => setBarangays(data.barangays))
      .catch(() => setBarangays([]));
  }, []);

  const categoryFactors = useMemo(
    () => RISK_FACTORS_BY_CATEGORY[category] ?? [],
    [category]
  );

  const toggleFactor = (key: RiskFactorKey) => {
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetForm = () => {
    setBarangayId('');
    setCategory('VECTOR_BORNE');
    setFactors({ ...EMPTY_FACTORS });
    setNotes('');
    setSubmittedByName('');
    setSubmittedByContact('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!barangayId) {
      setError('Please select your barangay.');
      return;
    }

    const hasFactor = categoryFactors.some((f) => factors[f.key as RiskFactorKey]);
    if (!hasFactor) {
      setError('Select at least one risk factor for the chosen category.');
      return;
    }

    setSubmitting(true);
    try {
      await apiPost('/public/reports', {
        barangayId,
        category,
        ...factors,
        notes: notes.trim() || undefined,
        submittedByName: submittedByName.trim() || undefined,
        submittedByContact: submittedByContact.trim() || undefined,
      });
      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card border border-green-200 bg-green-50">
        <h2 className="text-lg font-semibold text-gray-900">Report submitted</h2>
        <p className="text-sm text-gray-700 mt-2">
          Thank you — your report was submitted and will be reviewed by health staff before it
          appears in community surveillance data.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setOpen(true);
          }}
          className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Report an environmental risk</h2>
          <p className="text-sm text-gray-600 mt-1">
            Residents can flag community health risks. Submissions are reviewed before being added to
            official surveillance records.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shrink-0"
          >
            Submit a report
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-gray-200 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Barangay *</label>
              <select
                value={barangayId}
                onChange={(e) => setBarangayId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select barangay…</option>
                {barangays.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setFactors({ ...EMPTY_FACTORS });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {RISK_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="text-xs font-medium text-gray-500 mb-2">Observed risk factors *</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryFactors.map((f) => (
                <label
                  key={f.key}
                  className="flex items-center gap-2 text-sm text-gray-800 rounded-lg border border-gray-200 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={factors[f.key as RiskFactorKey]}
                    onChange={() => toggleFactor(f.key as RiskFactorKey)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Additional details</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Location, duration, or other helpful context (optional)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Your name (optional)</label>
              <input
                type="text"
                value={submittedByName}
                onChange={(e) => setSubmittedByName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Contact phone or email (optional)
              </label>
              <input
                type="text"
                value={submittedByContact}
                onChange={(e) => setSubmittedByContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
