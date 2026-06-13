import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui/Card';
import { Encounter } from '../../types';
import { formatDate } from '../../utils/formatters';

interface VitalTrendsChartProps {
  encounters: Encounter[];
}

export function VitalTrendsChart({ encounters }: VitalTrendsChartProps) {
  const data = [...encounters]
    .filter((e) => e.vitalSign)
    .sort((a, b) => new Date(a.encounterDate).getTime() - new Date(b.encounterDate).getTime())
    .map((e) => ({
      date: formatDate(e.encounterDate),
      temp: e.vitalSign?.temperature ?? null,
      hr: e.vitalSign?.heartRate ?? null,
      spo2: e.vitalSign?.oxygenSat ?? null,
      systolic: e.vitalSign?.systolic ?? null,
      bmi: e.vitalSign?.bmi ?? null,
    }));

  if (data.length < 2) {
    return (
      <Card title="Vital trends" subtitle="At least two encounters with vitals are needed to show trends.">
        <p className="text-sm text-slate-500">Record vitals on follow-up visits to see trends here.</p>
      </Card>
    );
  }

  return (
    <Card title="Vital trends" subtitle="Longitudinal view across encounters.">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[90, 100]} hide />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#ef4444" dot />
            <Line yAxisId="left" type="monotone" dataKey="hr" name="HR (bpm)" stroke="#3b82f6" dot />
            <Line yAxisId="left" type="monotone" dataKey="systolic" name="Systolic BP" stroke="#8b5cf6" dot />
            <Line yAxisId="left" type="monotone" dataKey="spo2" name="SpO₂ (%)" stroke="#10b981" dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
