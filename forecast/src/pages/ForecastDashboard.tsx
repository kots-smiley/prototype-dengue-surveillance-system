import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { apiGet } from '../services/api';
import { BrandLogo } from '../components/BrandLogo';
import { ResidentReportForm } from '../components/ResidentReportForm';

type RiskLevelUi = 'LOW' | 'MEDIUM' | 'HIGH';

interface PublicDisease {
  id: string;
  name: string;
  code: string;
  category: string;
  color?: string | null;
}

interface Summary {
  meta: { lastUpdated: string; systemActive: boolean };
  stats: {
    activeCases: number;
    totalCasesThisMonth: number;
    currentWeekCases: number;
    currentWeekReports: number;
    forecastNextWeek: number;
    criticalRegions: number;
  };
  weeklyTrends: Array<{ week: string; cases: number; reports: number }>;
  forecastNext4Weeks: Array<{ week: string; cases: number; lower: number; upper: number }>;
  regionalRiskAssessment: Array<{
    id: string;
    name: string;
    municipality: string;
    province: string;
    casesReported: number;
    riskScore: number;
    riskLevel: RiskLevelUi;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  activeAlerts: Array<{
    id: string;
    title: string;
    message: string;
    riskLevel: string;
    status: string;
    triggeredAt: string;
    disease: null | { id: string; name: string; code: string };
    barangay: null | { id: string; name: string; municipality: string; province: string };
  }>;
}

function riskBadge(level: RiskLevelUi) {
  switch (level) {
    case 'HIGH':
      return 'badge badge-danger';
    case 'MEDIUM':
      return 'badge badge-warning';
    default:
      return 'badge badge-success';
  }
}

function riskRowBg(level: RiskLevelUi) {
  switch (level) {
    case 'HIGH':
      return 'bg-red-50 border-red-200';
    case 'MEDIUM':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-green-50 border-green-200';
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function ForecastDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [diseases, setDiseases] = useState<PublicDisease[]>([]);
  const [diseaseId, setDiseaseId] = useState('');
  const isMobile = useMediaQuery('(max-width: 639px)');

  useEffect(() => {
    apiGet<{ diseases: PublicDisease[] }>('/public/diseases')
      .then((data) => setDiseases(data.diseases))
      .catch(() => setDiseases([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = diseaseId ? `?diseaseId=${diseaseId}` : '';
        const data = await apiGet<Summary>(`/public/forecast/summary${query}`);
        setSummary(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load forecast data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [diseaseId]);

  const headerMeta = useMemo(() => {
    const lastUpdated = summary?.meta?.lastUpdated ? new Date(summary.meta.lastUpdated) : null;
    return {
      lastUpdatedText: lastUpdated ? format(lastUpdated, 'MMM d, yyyy HH:mm') : '—',
      systemActive: summary?.meta?.systemActive ?? false,
    };
  }, [summary]);

  const selectedDiseaseName = diseases.find((d) => d.id === diseaseId)?.name ?? 'All Diseases';

  const forecastChartData =
    summary?.forecastNext4Weeks.map((d) => ({
      ...d,
      lowerBand: d.lower,
      upperBand: d.upper,
    })) ?? [];

  const weekTick = (label: string) => (isMobile ? label.split('-')[0] || label : label);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  HealthWatch Public Forecast
                </h1>
                <p className="text-sm text-gray-600">
                  Multi-disease surveillance — Municipality of Lopez, Quezon
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div className="text-right min-w-[10rem]">
                <div className="text-[11px] text-gray-500">Last Updated</div>
                <div className="text-sm font-medium text-gray-800">{headerMeta.lastUpdatedText}</div>
              </div>
              <span className={headerMeta.systemActive ? 'badge badge-success' : 'badge badge-danger'}>
                {headerMeta.systemActive ? 'System Active' : 'System Offline'}
              </span>
            </div>
          </div>

          <div className="mt-4 max-w-xs">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by disease</label>
            <select
              value={diseaseId}
              onChange={(e) => setDiseaseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All diseases</option>
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 min-w-0">
        {loading && <div className="text-center py-6 text-gray-600">Loading forecast...</div>}

        {!loading && (error || !summary) && (
          <div className="card border border-red-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load forecast</h2>
            <p className="text-sm text-gray-700">{error || 'Unknown error'}</p>
            <p className="text-xs text-gray-500 mt-3">
              Tip: ensure the backend is running and VITE_API_URL points to it.
            </p>
          </div>
        )}

        {!loading && summary && (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Cases" hint="Last 7 days" value={summary.stats.activeCases} accent="bg-blue-500" />
          <StatCard
            label="Total Cases (This Month)"
            hint="Month to date"
            value={summary.stats.totalCasesThisMonth}
            accent="bg-purple-500"
          />
          <StatCard
            label="Forecasted (Next Week)"
            hint="Statistical projection"
            value={summary.stats.forecastNextWeek}
            accent="bg-orange-500"
          />
          <StatCard
            label="High-Risk Regions"
            hint="Barangays at high risk"
            value={summary.stats.criticalRegions}
            accent="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Cases This Week"
            hint="Since Monday"
            value={summary.stats.currentWeekCases}
            accent="bg-teal-500"
          />
          <StatCard
            label="Risk Reports This Week"
            hint="Approved reports since Monday"
            value={summary.stats.currentWeekReports}
            accent="bg-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Forecast (Next 4 Weeks) — {selectedDiseaseName}
              </h2>
              <span className="text-xs text-gray-500 hidden sm:inline">Bounds are indicative</span>
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
              <AreaChart data={forecastChartData} margin={{ top: 10, right: 16, left: 0, bottom: isMobile ? 8 : 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tickFormatter={weekTick}
                  angle={isMobile ? 0 : -30}
                  textAnchor={isMobile ? 'middle' : 'end'}
                  height={isMobile ? 28 : 60}
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={isMobile ? 6 : 10}
                />
                <YAxis width={isMobile ? 30 : 40} tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
                <Area type="monotone" dataKey="upperBand" name="Upper Bound" stroke="#93c5fd" fill="#dbeafe" fillOpacity={0.6} />
                <Area type="monotone" dataKey="lowerBand" name="Lower Bound" stroke="#bfdbfe" fill="#ffffff" fillOpacity={0.0} />
                <Area type="monotone" dataKey="cases" name="Forecast" stroke="#0284c7" fill="#93c5fd" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card min-w-0 overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Trends (Last {summary.weeklyTrends.length} Weeks)
            </h2>
            <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
              <BarChart data={summary.weeklyTrends} margin={{ top: 10, right: 16, left: 0, bottom: isMobile ? 8 : 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tickFormatter={weekTick}
                  angle={isMobile ? 0 : -30}
                  textAnchor={isMobile ? 'middle' : 'end'}
                  height={isMobile ? 28 : 60}
                  interval={
                    isMobile
                      ? Math.max(0, Math.floor(summary.weeklyTrends.length / 4) - 1)
                      : Math.max(0, Math.floor(summary.weeklyTrends.length / 8) - 1)
                  }
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={isMobile ? 6 : 10}
                />
                <YAxis width={isMobile ? 30 : 40} tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
                <Bar dataKey="cases" name="Cases" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="reports" name="Risk reports" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Risk Assessment</h2>
            <div className="space-y-3">
              {summary.regionalRiskAssessment.map((r) => (
                <div key={r.id} className={`border rounded-lg p-4 ${riskRowBg(r.riskLevel)}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-xs text-gray-600 break-words">
                        {r.municipality}, {r.province} • {r.casesReported} cases (30d)
                      </div>
                    </div>
                    <div className="sm:text-right flex sm:block items-center gap-2 sm:gap-0">
                      <div className={riskBadge(r.riskLevel)}>{r.riskLevel}</div>
                      <div className="text-xs text-gray-600 sm:mt-1">{r.trend}</div>
                    </div>
                  </div>
                </div>
              ))}
              {summary.regionalRiskAssessment.length === 0 && (
                <div className="text-sm text-gray-600">No risk assessment data available.</div>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">Risk legend: LOW, MEDIUM, HIGH</div>
          </div>

          <div className="card min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {summary.activeAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`border rounded-lg p-4 ${
                    a.riskLevel === 'HIGH'
                      ? 'bg-red-50 border-red-200'
                      : a.riskLevel === 'MEDIUM'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 break-words">{a.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {a.disease ? `${a.disease.name} • ` : ''}
                    {a.barangay?.name ?? ''}
                  </div>
                  <div className="text-xs text-gray-700 mt-2 leading-5 break-words">{a.message}</div>
                  <div className="text-[11px] text-gray-500 mt-2">
                    {a.triggeredAt ? format(new Date(a.triggeredAt), 'PPp') : ''}
                  </div>
                </div>
              ))}
              {summary.activeAlerts.length === 0 && (
                <div className="text-sm text-gray-600">No active alerts.</div>
              )}
            </div>
          </div>
        </div>
          </>
        )}

        <ResidentReportForm />
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent: string;
}) {
  return (
    <div className="card min-w-0">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{hint}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <div className={`w-5 h-5 ${accent} rounded`} />
        </div>
      </div>
    </div>
  );
}
