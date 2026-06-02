import { Disease } from '../../types';

interface DiseaseFilterProps {
  diseases: Disease[];
  value: string;
  onChange: (diseaseId: string) => void;
  label?: string;
  includeAll?: boolean;
}

/** Reusable disease dropdown used across dashboards and lists. */
export function DiseaseFilter({
  diseases,
  value,
  onChange,
  label = 'Disease',
  includeAll = true,
}: DiseaseFilterProps) {
  return (
    <div className="space-y-1">
      <label className="input-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {includeAll && <option value="">All diseases</option>}
        {diseases.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}
