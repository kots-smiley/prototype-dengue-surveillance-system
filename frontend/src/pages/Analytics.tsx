import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { StatCard } from '../components/domain/StatCard';
import { DiseaseFilter } from '../components/domain/DiseaseFilter';
import { Select } from '../components/ui/Select';
import { useApiResource } from '../hooks/useApiResource';
import { dashboardService } from '../services/dashboard-service';
import { diseaseService } from '../services/disease-service';
import { predictionService } from '../services/prediction-service';
import { BarangayForecast } from '../types';

const FALLBACK_COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

function riskTone(score: number): { label: string; tone: 'success' | 'warning' | 'danger' } {
  if (score >= 40) return { label: 'HIGH', tone: 'danger' };
  if (score >= 15) return { label: 'MEDIUM', tone: 'warning' };
  return { label: 'LOW', tone: 'success' };
}

function forecastRiskTone(level: BarangayForecast['riskLevel']): 'success' | 'warning' | 'danger' {
  if (level === 'HIGH') return 'danger';
  if (level === 'MEDIUM') return 'warning';
  return 'success';
}

function trendLabel(trend: 'increasing' | 'decreasing' | 'stable'): string {
  switch (trend) {
    case 'increasing':
      return '↑ Increasing';
    case 'decreasing':
      return '↓ Decreasing';
    default:
      return '→ Stable';
  }
}

function trendTone(trend: 'increasing' | 'decreasing' | 'stable'): 'danger' | 'success' | 'default' {
  switch (trend) {
    case 'increasing':
      return 'danger';
    case 'decreasing':
      return 'success';
    default:
      return 'default';
  }
}

export default function Analytics() {
  const [diseaseId, setDiseaseId] = useState('');
  const [months, setMonths] = useState(24);

  const { data: diseasesData } = useApiResource(() => diseaseService.list({ isActive: 'true' }), []);
  const { data, loading, refreshing } = useApiResource(
    () =>
      Promise.all([
        dashboardService.stats({ diseaseId: diseaseId || undefined }),
        dashboardService.trends({ diseaseId: diseaseId || undefined, months }),
        dashboardService.weeklyTrends({ diseaseId: diseaseId || undefined, weeks: 12 }),
        dashboardService.rankings({ diseaseId: diseaseId || undefined, limit: 10 }),
        dashboardService.diseaseBreakdown(),
        predictionService.getPredictions({
          diseaseId: diseaseId || undefined,
          months,
          horizon: 3,
        }),
        predictionService.getBarangayPredictions({
          diseaseId: diseaseId || undefined,
          limit: 10,
        }),
      ]),
    [diseaseId, months],
    { errorMessage: 'Failed to load analytics' }
  );

  const chartData = useMemo(() => {
    if (!data) return [];
    const predictions = data[5].data;
    const historical = predictions.historical.map((h) => ({
      label: h.label,
      actual: h.cases,
      forecast: null as number | null,
      lowerBand: null as number | null,
      upperBand: null as number | null,
    }));
    const forecast = predictions.forecast.map((f) => ({
      label: f.label,
      actual: null as number | null,
      forecast: f.cases,
      lowerBand: f.lower,
      upperBand: f.upper,
    }));
    return [...historical, ...forecast];
  }, [data]);

  if (loading || !data) {
    return <Spinner label="Running predictive analysis..." />;
  }

  const [statsRes, trendsRes, weeklyRes, rankingsRes, breakdownRes, predictionsRes, barangayPredRes] = data;
  const stats = statsRes.data.stats;
  const trends = trendsRes.data.trends;
  const weeklyTrends = weeklyRes.data.trends;
  const rankings = rankingsRes.data.rankings;
  const breakdown = breakdownRes.data.breakdown;
  const predictions = predictionsRes.data;
  const barangayForecasts = barangayPredRes.data.barangays;
  const diseases = diseasesData?.data.diseases ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Trends, ML forecasts, and barangay risk rankings"
        actions={
          <Select
            className="max-w-[12rem]"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value, 10))}
            label="Timeline"
          >
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
            <option value={36}>Last 36 months</option>
          </Select>
        }
      />

      <Card title="Filter context" subtitle="Analyze one disease at a time, or all diseases.">
        <div className="max-w-xs">
          <DiseaseFilter diseases={diseases} value={diseaseId} onChange={setDiseaseId} />
        </div>
      </Card>

      {refreshing && (
        <p className="text-xs font-medium text-slate-500">Refreshing predictions...</p>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Predictive analysis disclaimer</p>
        <p className="mt-1 text-amber-800">{predictions.disclaimer}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Next month forecast"
          value={predictions.summary.nextMonthCases}
          hint={`Model: ${predictions.model.name} (${predictions.model.trainedOnMonths} mo. history)`}
          tone="primary"
        />
        <StatCard
          label="Trend direction"
          value={trendLabel(predictions.summary.trend)}
          hint="Based on recent history and forecast"
          tone={trendTone(predictions.summary.trend)}
        />
        <StatCard
          label="Threshold status"
          value={
            predictions.summary.caseThreshold != null
              ? predictions.summary.thresholdBreach
                ? 'May exceed threshold'
                : 'Within threshold'
              : 'No threshold set'
          }
          hint={
            predictions.summary.caseThreshold != null
              ? `Threshold: ${predictions.summary.caseThreshold} cases/month`
              : 'Select a disease to compare'
          }
          tone={predictions.summary.thresholdBreach ? 'danger' : 'success'}
        />
        <StatCard
          label="Cases this week"
          value={stats.currentWeekCases}
          hint={`${stats.weekCaseIncrease >= 0 ? '+' : ''}${stats.weekCaseIncrease}% vs last week`}
          tone={stats.weekCaseIncrease > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Risk reports this week"
          value={stats.currentWeekReports}
          hint={`${stats.weekReportIncrease >= 0 ? '+' : ''}${stats.weekReportIncrease}% vs last week`}
        />
        <StatCard
          label="Seasonal model"
          value={predictions.model.seasonal ? 'Enabled (S=12)' : 'Not applied'}
          hint={
            predictions.model.name === 'LinearRegression'
              ? 'Fallback used — insufficient history for AutoARIMA'
              : 'AutoARIMA time-series model'
          }
        />
      </div>

      <Card title="ML case forecast" subtitle="Historical counts plus 3-month AutoARIMA projection with confidence bands.">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="upperBand"
              name="Upper bound"
              stroke="#93c5fd"
              fill="#dbeafe"
              fillOpacity={0.5}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="lowerBand"
              name="Lower bound"
              stroke="#bfdbfe"
              fill="#ffffff"
              fillOpacity={0}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual cases"
              stroke="#0ea5e9"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 4"
              connectNulls={false}
              dot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Weekly surveillance activity" subtitle="Cases and approved risk reports by week (last 12 weeks).">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="cases" name="Cases" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reports" name="Risk reports" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Monthly historical trend" subtitle="Raw monthly case counts used to train the model.">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
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
        <Card title="Cases by disease">
          {breakdown.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No case data yet.</p>
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

        <Card title="Barangay risk ranking">
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

      <Card
        title="Barangay forecast (next month)"
        subtitle="ML-predicted case counts per barangay, ranked by expected burden."
      >
        <div className="table-shell">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="table-head">
              <tr>
                <th className="table-head-cell">#</th>
                <th className="table-head-cell">Barangay</th>
                <th className="table-head-cell">Predicted cases</th>
                <th className="table-head-cell">Range</th>
                <th className="table-head-cell">Trend</th>
                <th className="table-head-cell">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {barangayForecasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-slate-500">
                    No barangay forecast data available.
                  </td>
                </tr>
              ) : (
                barangayForecasts.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="table-cell">{idx + 1}</td>
                    <td className="table-cell font-semibold text-slate-900">{b.name}</td>
                    <td className="table-cell">{b.predictedCases}</td>
                    <td className="table-cell text-sm text-slate-600">
                      {b.lower} – {b.upper}
                    </td>
                    <td className="table-cell">{trendLabel(b.trend)}</td>
                    <td className="table-cell">
                      <Badge tone={forecastRiskTone(b.riskLevel)}>{b.riskLevel}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Top risk barangays (historical)" subtitle="Current-year risk score from cases, reports, and alerts.">
        <div className="table-shell">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="table-head">
              <tr>
                <th className="table-head-cell">#</th>
                <th className="table-head-cell">Barangay</th>
                <th className="table-head-cell">Cases</th>
                <th className="table-head-cell">Reports</th>
                <th className="table-head-cell">Active Alerts</th>
                <th className="table-head-cell">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {rankings.map((r, idx) => {
                const risk = riskTone(r.riskScore);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="table-cell">{idx + 1}</td>
                    <td className="table-cell font-semibold text-slate-900">{r.name}</td>
                    <td className="table-cell">{r.caseCount}</td>
                    <td className="table-cell">{r.reportCount}</td>
                    <td className="table-cell">{r.activeAlerts}</td>
                    <td className="table-cell">
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
