import { useState } from 'react';
import { Link } from 'react-router';
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
import { StatCard } from '../components/domain/StatCard';
import { DiseaseFilter } from '../components/domain/DiseaseFilter';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { useApiResource } from '../hooks/useApiResource';
import { dashboardService } from '../services/dashboard-service';
import { diseaseService } from '../services/disease-service';

const FALLBACK_COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [diseaseId, setDiseaseId] = useState('');

  const { data: diseasesData } = useApiResource(() => diseaseService.list({ isActive: 'true' }), []);
  const { data, loading } = useApiResource(
    () =>
      Promise.all([
        dashboardService.stats({ diseaseId: diseaseId || undefined }),
        dashboardService.trends({ diseaseId: diseaseId || undefined, months: 12 }),
        dashboardService.weeklyTrends({ diseaseId: diseaseId || undefined, weeks: 12 }),
        dashboardService.diseaseBreakdown(),
        dashboardService.barangayCases({ diseaseId: diseaseId || undefined }),
      ]),
    [diseaseId],
    { errorMessage: 'Failed to load dashboard data' }
  );

  if (loading || !data) {
    return <Spinner label="Loading dashboard..." />;
  }

  const [statsRes, trendsRes, weeklyRes, breakdownRes, barangayCases] = data;
  const stats = statsRes.data.stats;
  const trends = trendsRes.data.trends;
  const weeklyTrends = weeklyRes.data.trends;
  const breakdown = breakdownRes.data.breakdown;
  const barangays = [...barangayCases.data].sort((a, b) => b.caseCount - a.caseCount);
  const diseases = diseasesData?.data.diseases ?? [];
  const maxCases = Math.max(...barangays.map((b) => b.caseCount), 1);

  const barColor = (count: number) => {
    if (count === 0) return '#94a3b8';
    const ratio = count / maxCases;
    if (ratio > 0.7) return '#ef4444';
    if (ratio > 0.4) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Municipality-wide disease surveillance overview"
        actions={
          <Link to="/analytics">
            <Button variant="secondary">View Analytics</Button>
          </Link>
        }
      />

      <Card title="Filter context" subtitle="Narrow the dashboard to one disease when needed.">
        <div className="max-w-xs">
          <DiseaseFilter diseases={diseases} value={diseaseId} onChange={setDiseaseId} />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Cases" value={stats.totalCases} tone="primary" index={0} />
        <StatCard
          label="Cases This Month"
          value={stats.currentMonthCases}
          hint={`${stats.caseIncrease >= 0 ? '+' : ''}${stats.caseIncrease}% vs last month`}
          tone={stats.caseIncrease > 0 ? 'danger' : 'success'}
          index={1}
        />
        <StatCard label="Active Alerts" value={stats.activeAlerts} tone="danger" index={2} />
        <StatCard label="Tracked Diseases" value={stats.totalDiseases} index={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cases This Week"
          value={stats.currentWeekCases}
          hint={`${stats.weekCaseIncrease >= 0 ? '+' : ''}${stats.weekCaseIncrease}% vs last week`}
          tone={stats.weekCaseIncrease > 0 ? 'danger' : 'success'}
          index={4}
        />
        <StatCard
          label="Risk Reports This Week"
          value={stats.currentWeekReports}
          hint={`${stats.weekReportIncrease >= 0 ? '+' : ''}${stats.weekReportIncrease}% vs last week`}
          index={5}
        />
        <StatCard
          label="Reports This Month"
          value={stats.totalReports}
          hint="Approved environmental reports"
          index={6}
        />
        <StatCard label="Barangays" value={stats.totalBarangays} index={7} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly surveillance activity" subtitle="Cases and approved risk reports by week (last 12 weeks).">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" name="Cases" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reports" name="Risk reports" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Monthly case trend" subtitle="12-month historical signal for reporting and surge checks.">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Cases by disease" subtitle="Breakdown of total case burden by disease.">
          {breakdown.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No case data yet.</p>
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
      </div>

      <Card title="Cases by barangay" subtitle="Relative barangay burden using color and labels.">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barangays} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => [value, 'Cases']} />
            <Legend />
            <Bar dataKey="caseCount" name="Cases" radius={[6, 6, 0, 0]}>
              {barangays.map((entry) => (
                <Cell key={entry.id} fill={barColor(entry.caseCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
