import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { DiseaseFilter } from '../components/domain/DiseaseFilter';
import { useApiResource } from '../hooks/useApiResource';
import { dashboardService } from '../services/dashboard-service';
import { diseaseService } from '../services/disease-service';

const FALLBACK_COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

function riskTone(score: number): { label: string; tone: 'success' | 'warning' | 'danger' } {
  if (score >= 40) return { label: 'HIGH', tone: 'danger' };
  if (score >= 15) return { label: 'MEDIUM', tone: 'warning' };
  return { label: 'LOW', tone: 'success' };
}

export default function Analytics() {
  const [diseaseId, setDiseaseId] = useState('');
  const [months, setMonths] = useState(24);

  const { data: diseasesData } = useApiResource(() => diseaseService.list({ isActive: 'true' }), []);
  const { data, loading } = useApiResource(
    () =>
      Promise.all([
        dashboardService.trends({ diseaseId: diseaseId || undefined, months }),
        dashboardService.rankings({ diseaseId: diseaseId || undefined, limit: 10 }),
        dashboardService.diseaseBreakdown(),
      ]),
    [diseaseId, months],
    { errorMessage: 'Failed to load analytics' }
  );

  if (loading || !data) {
    return <Spinner label="Loading analytics..." />;
  }

  const [trendsRes, rankingsRes, breakdownRes] = data;
  const trends = trendsRes.data.trends;
  const rankings = rankingsRes.data.rankings;
  const breakdown = breakdownRes.data.breakdown;
  const diseases = diseasesData?.data.diseases ?? [];

  // Simple linear-regression projection for the next 3 months (rule-based, not ML).
  const projection = (() => {
    const y = trends.map((t) => t.cases);
    const n = y.length;
    if (n < 3) return [];
    const x = y.map((_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
    const sumXX = x.reduce((s, xi) => s + xi * xi, 0);
    const denom = n * sumXX - sumX * sumX;
    const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return Array.from({ length: 3 }, (_, i) => {
      const predicted = Math.max(0, Math.round(slope * (n + i) + intercept));
      return { month: `Forecast +${i + 1}`, cases: predicted, projected: true };
    });
  })();

  const combinedTrend = [
    ...trends.map((t) => ({ month: t.month, cases: t.cases, projected: false })),
    ...projection,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Trends, rankings, and rule-based projections"
        actions={
          <select
            className="input max-w-[10rem]"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value, 10))}
          >
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
            <option value={36}>Last 36 months</option>
          </select>
        }
      />

      <Card>
        <div className="max-w-xs">
          <DiseaseFilter diseases={diseases} value={diseaseId} onChange={setDiseaseId} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-1">Case Trend & 3-Month Projection</h2>
        <p className="text-sm text-gray-500 mb-4">
          Dashed forecast uses simple linear regression on historical counts (rule-based, not AI/ML).
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={combinedTrend} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cases" name="Cases" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Cases by Disease</h2>
          {breakdown.length === 0 ? (
            <p className="text-gray-500 text-sm py-12 text-center">No case data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="caseCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${entry.caseCount})`}
                >
                  {breakdown.map((entry, index) => (
                    <Cell
                      key={entry.diseaseId}
                      fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Barangay Risk Ranking</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rankings} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-40} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="riskScore" name="Risk Score" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Top Risk Barangays</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cases</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reports</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Alerts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.map((r, idx) => {
                const risk = riskTone(r.riskScore);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.caseCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.reportCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.activeAlerts}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge tone={risk.tone}>
                        {risk.label} ({r.riskScore})
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
