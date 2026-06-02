import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DiseaseFilter } from '../components/domain/DiseaseFilter';
import { useApiResource } from '../hooks/useApiResource';
import { exportService } from '../services/export-service';
import { diseaseService } from '../services/disease-service';
import { ApiError } from '../utils/api-client';

export default function Exports() {
  const [busy, setBusy] = useState(false);
  const [diseaseId, setDiseaseId] = useState('');
  const { data: diseasesData } = useApiResource(() => diseaseService.list({ isActive: 'true' }), []);
  const diseases = diseasesData?.data.diseases ?? [];

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(`${label} exported`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to export ${label.toLowerCase()}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Data Exports" subtitle="Download surveillance data as CSV or Excel" />

      <Card title="Export scope" subtitle="Limit datasets by disease when needed.">
        <div className="max-w-xs">
          <DiseaseFilter diseases={diseases} value={diseaseId} onChange={setDiseaseId} />
          <p className="mt-1 text-xs text-slate-500">
            Applies to Cases and Summary exports.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Cases" subtitle="Detailed line-level records.">
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => run('Cases', () => exportService.cases({ format: 'csv', diseaseId: diseaseId || undefined }))}
            >
              Export as CSV
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => run('Cases', () => exportService.cases({ format: 'xlsx', diseaseId: diseaseId || undefined }))}
            >
              Export as Excel
            </Button>
          </div>
        </Card>

        <Card title="Risk reports" subtitle="Environmental and transmission factors.">
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => run('Risk reports', () => exportService.reports({ format: 'csv' }))}
            >
              Export as CSV
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => run('Risk reports', () => exportService.reports({ format: 'xlsx' }))}
            >
              Export as Excel
            </Button>
          </div>
        </Card>

        <Card title="Monthly summary" subtitle="Consolidated surveillance totals.">
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => run('Summary', () => exportService.summary({ format: 'csv', diseaseId: diseaseId || undefined }))}
            >
              Export as CSV
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => run('Summary', () => exportService.summary({ format: 'xlsx', diseaseId: diseaseId || undefined }))}
            >
              Export as Excel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
