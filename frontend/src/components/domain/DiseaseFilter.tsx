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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
