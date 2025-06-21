// =====================================
// components/ProjectDetails.tsx
//
// Displays key project information in a clean, responsive layout.
// Features:
// - Budget with currency formatting
// - Formatted deadline date/time
// - Status badge with dynamic styling
// - Responsive design (mobile and desktop)
// - Consistent spacing and typography
// =====================================

import { Project, ProjectStatus } from "../../types";
import { Clock, DollarSign, Zap } from 'lucide-react';
import { currencySymbols } from "../ProjectForm";

/**
 * Props interface for ProjectDetails component
 * @property {Project} project - The project object containing details to display
 */
interface ProjectDetailsProps {
  project: Project;
}

/**
 * ProjectDetails component displays key project information in a structured format.
 * @param {ProjectDetailsProps} props - Component props
 * @returns {React.ReactElement} A section displaying project details
 */
export default function ProjectDetails({ project }: ProjectDetailsProps) {
  /**
   * Formats a date string into a readable format
   * @param {string} date - ISO date string
   * @returns {string} Formatted date string (e.g. "Jan 1, 2023, 2:30 PM")
   */
  const formatDate = (date: string) => 
    new Date(date).toLocaleString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  /**
   * Returns Tailwind classes for styling based on project status
   * @param {ProjectStatus} status - The project status
   * @returns {string} Tailwind classes for the status badge
   */
  const getStatusStyles = (status: ProjectStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "IN_PROGRESS":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "CHANGES_REQUESTED":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-slate-600/50 text-slate-300 border border-slate-600/80";
    }
  };

  /**
   * Array of detail items to display
   * Each item contains:
   * - icon: React element
   * - label: Display text
   * - value: Formatted value or React element
   * - valueClass: Optional Tailwind classes for value styling
   * - isBadge: Flag for badge-style rendering
   */
  const detailItems = [
    {
      icon: <DollarSign size={16} className="text-slate-500" />,
      label: "Budget",
      value: `${currencySymbols[project.budgetCurrency]} ${project.budget.toLocaleString()}`,
      valueClass: "text-emerald-400 font-bold",
    },
    {
      icon: <Clock size={16} className="text-slate-500" />,
      label: "Deadline",
      value: formatDate(project.deadline),
      valueClass: "text-slate-300 text-right sm:text-left", // Right-aligned on mobile, left on desktop
    },
    {
      icon: <Zap size={16} className="text-slate-500" />,
      label: "Status",
      value: (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(project.status)}`}>
          {project.status.replace("_", " ")}
        </span>
      ),
      isBadge: true,
    },
  ];

  return (
    <div className="flex-grow">
      {/* Section heading */}
      <h4 className="text-lg font-semibold text-slate-200 mb-4">Project Details</h4>
      
      {/* Details list container with consistent spacing */}
      <div className="space-y-3">
        {detailItems.map((item, index) => (
          /* Responsive item container:
             - Mobile: Vertical stack (flex-col)
             - Desktop: Horizontal layout (sm:flex-row) with space between
          */
          <div 
            key={index} 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 text-sm"
          >
            {/* Left side - icon and label */}
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-slate-400 font-medium">{item.label}:</span>
            </div>

            {/* Right side - value or badge */}
            {item.isBadge ? (
              <div className="self-start sm:self-center">{item.value}</div>
            ) : (
              <span className={item.valueClass}>{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}