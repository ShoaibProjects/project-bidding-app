// =====================================
// components/SortSelector.tsx
// 
// A reusable sort selector dropdown component with TypeScript generics support.
// Features:
// - Fully accessible with proper labeling
// - Customizable options with ReactNode support
// - Dark mode styling
// - Type-safe generic implementation
// =====================================

import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Props interface for the SortSelector component
 * @template T - Type extending string that represents the option values
 * @property {T} selected - Currently selected value
 * @property {(value: T) => void} onChange - Callback when selection changes
 * @property {Record<T, ReactNode>} options - Object mapping values to display labels
 * @property {string} label - Accessibility label for the selector
 * @property {string} [className] - Optional additional className for the container
 */
interface SortSelectorProps<T extends string> {
  selected: T;
  onChange: (value: T) => void;
  options: Record<T, ReactNode>;
  label: string;
  className?: string;
}

/**
 * Generic SortSelector component
 * @template T - Type extending string that represents the option values
 * @param {SortSelectorProps<T>} props - Component props
 * @returns {React.ReactElement} A styled and accessible sort selector dropdown
 */
export default function SortSelector<T extends string>({
  selected,
  onChange,
  options,
  label,
  className = '',
}: SortSelectorProps<T>) {
  return (
    // Main container with optional className prop
    <div className={`relative ${className}`}>
      {/* Accessibility label - visually hidden but available for screen readers */}
      <label htmlFor={label} className="sr-only">
        {label}
      </label>

      {/* Flex container for responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
        {/* Display label visible to all users */}
        <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
          {label}:
        </span>

        {/* Select dropdown container */}
        <div className="relative">
          {/* Native select element with custom styling */}
          <select
            id={label} // Matches the htmlFor in label for accessibility
            value={selected}
            onChange={(e) => onChange(e.target.value as T)}
            className="appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer hover:bg-slate-700/60"
          >
            {/* Dynamically render options from the options prop */}
            {Object.entries(options).map(([value, optionLabel]) => (
              <option
                key={value}
                value={value}
                className="bg-slate-800 text-slate-200" // Ensure dark mode styling for options
              >
                {optionLabel as ReactNode}
              </option>
            ))}
          </select>

          {/* Custom dropdown indicator (replaces native arrow) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}