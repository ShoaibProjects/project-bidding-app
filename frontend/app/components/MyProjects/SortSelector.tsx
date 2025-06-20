// =====================================
// components/SortSelector.tsx
// =====================================
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface SortSelectorProps<T extends string> {
  selected: T;
  onChange: (value: T) => void;
  options: Record<T, ReactNode>;
  label: string;
  className?: string;
}

export default function SortSelector<T extends string>({
  selected,
  onChange,
  options,
  label,
  className = '',
}: SortSelectorProps<T>) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={label} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
          {label}:
        </span>
        <div className="relative">
          <select
            id={label} // Added id for better accessibility
            value={selected}
            onChange={(e) => onChange(e.target.value as T)}
            className="appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer hover:bg-slate-700/60"
          >
            {Object.entries(options).map(([value, optionLabel]) => (
              <option
                key={value}
                value={value}
                className="bg-slate-800 text-slate-200" // Style options for consistency
              >
                {optionLabel as ReactNode}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}