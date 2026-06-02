import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { riskReportService } from '../services/risk-report-service';
import { barangayService } from '../services/barangay-service';
import { Barangay, RiskReport } from '../types';
import { ApiError } from '../utils/api-client';
import { toDateInputValue } from '../utils/formatters';
import { RISK_FACTORS_BY_CATEGORY } from '../configuration/options';

const CATEGORY_OPTIONS = [
  { value: 'VECTOR_BORNE', label: 'Vector-borne (e.g. dengue, malaria)' },
  { value: 'WATER_BORNE', label: 'Water-borne (e.g. typhoid, leptospirosis)' },
  { value: 'AIRBORNE', label: 'Airborne (e.g. influenza, measles, TB)' },
];

const ALL_FACTOR_KEYS = Object.values(RISK_FACTORS_BY_CATEGORY)
  .flat()
  .map((f) => f.key);

type FactorState = Record<string, boolean>;

function emptyFactors(): FactorState {
  return ALL_FACTOR_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {} as FactorState);
}

export default function ReportForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [barangayId, setBarangayId] = useState('');
  const [category, setCategory] = useState('VECTOR_BORNE');
  const [dateReported, setDateReported] = useState('');
  const [notes, setNotes] = useState('');
  const [factors, setFactors] = useState<FactorState>(emptyFactors());

  useEffect(() => {
    const load = async () => {
      try {
        const barangaysRes = await barangayService.list();
        setBarangays(barangaysRes.data.barangays);

        if (id) {
          const reportRes = await riskReportService.getById(id);
          const r = reportRes.data.report as RiskReport & Record<string, boolean>;
          setBarangayId(r.barangayId);
          setCategory(r.category);
          setDateReported(toDateInputValue(r.dateReported));
          setNotes(r.notes ?? '');
          const loaded = emptyFactors();
          ALL_FACTOR_KEYS.forEach((key) => {
            loaded[key] = Boolean(r[key]);
          });
          setFactors(loaded);
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load form data');
        if (id) navigate('/reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const toggleFactor = (key: string) => {
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barangayId) {
      toast.error('Please select a barangay');
      return;
    }
    setSubmitting(true);
    try {
      // Only send the factor keys relevant to the chosen category.
      const relevantKeys = (RISK_FACTORS_BY_CATEGORY[category] ?? []).map((f) => f.key);
      const factorPayload = relevantKeys.reduce(
        (acc, key) => ({ ...acc, [key]: factors[key] }),
        {} as FactorState
      );

      const payload = {
        barangayId,
        category,
        dateReported: dateReported || undefined,
        notes: notes.trim() || undefined,
        ...factorPayload,
      };

      if (id) {
        await riskReportService.update(id, payload);
        toast.success('Report updated');
      } else {
        await riskReportService.create(payload);
        toast.success('Report created');
      }
      navigate('/reports');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading form..." />;
  }

  const categoryFactors = RISK_FACTORS_BY_CATEGORY[category] ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={id ? 'Edit Risk Report' : 'New Risk Report'}
        subtitle="Follow the guided sections to reduce entry errors."
      />

      <Card title="1) Location and timeline">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Barangay *"
              value={barangayId}
              onChange={(e) => setBarangayId(e.target.value)}
            >
              <option value="">Select barangay</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>

            <Input
              label="Date Reported"
              type="date"
              value={dateReported}
              onChange={(e) => setDateReported(e.target.value)}
            />
          </div>

          <Select label="Transmission Category *" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <Card title="2) Observed risk factors" className="border border-slate-100 shadow-none">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Observed Risk Factors
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryFactors.map((f) => (
                <Checkbox
                  key={f.key}
                  label={f.label}
                  checked={factors[f.key] ?? false}
                  onChange={() => toggleFactor(f.key)}
                />
              ))}
            </div>
          </Card>

          <Card title="3) Optional notes" className="border border-slate-100 shadow-none">
            <Textarea
              label="Notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : id ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/reports')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
