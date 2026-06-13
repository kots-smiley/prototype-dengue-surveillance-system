import { useEffect, useRef, useState } from 'react';
import { terminologyService } from '../../services/ehr-service';
import { TerminologyConcept } from '../../types';

interface TerminologyComboboxProps {
  label?: string;
  system: 'ICD10' | 'LOINC' | 'SNOMED' | 'ATC';
  value: string;
  displayValue?: string;
  placeholder?: string;
  onSelect: (concept: TerminologyConcept) => void;
  onClear?: () => void;
}

export function TerminologyCombobox({
  label,
  system,
  value,
  displayValue,
  placeholder = 'Search codes…',
  onSelect,
  onClear,
}: TerminologyComboboxProps) {
  const [search, setSearch] = useState(displayValue ?? '');
  const [results, setResults] = useState<TerminologyConcept[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (displayValue !== undefined) setSearch(displayValue);
  }, [displayValue]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await terminologyService.list({ system, search: search.trim() });
        setResults(res.data.concepts.slice(0, 15));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, system]);

  return (
    <div className="relative">
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex gap-2">
        <input
          className="input w-full"
          value={search}
          placeholder={placeholder}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!e.target.value && onClear) onClear();
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {value && onClear && (
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={() => {
              setSearch('');
              onClear();
            }}
          >
            Clear
          </button>
        )}
      </div>
      {open && (results.length > 0 || loading) && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading && <li className="px-3 py-2 text-sm text-slate-500">Searching…</li>}
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => {
                  onSelect(c);
                  setSearch(`${c.code} — ${c.display}`);
                  setOpen(false);
                }}
              >
                <span className="font-mono text-xs text-slate-500">{c.code}</span>{' '}
                <span className="text-slate-800">{c.display}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
