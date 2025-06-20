// =====================================
// components/ProjectDetails.tsx
// =====================================
import { Project, ProjectStatus } from "../../types";
import { Clock, DollarSign, Zap } from 'lucide-react';
import { currencySymbols } from "../ProjectForm";

interface ProjectDetailsProps {
  project: Project;
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const formatDate = (date: string) => 
    new Date(date).toLocaleString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  // A helper to get modern, color-coded styles for different statuses
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
      valueClass: "text-slate-300",
    },
    {
      icon: <Zap size={16} className="text-slate-500" />,
      label: "Status",
      value: (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(project.status)}`}>
          {project.status.replace("_", " ")}
        </span>
      ),
      isBadge: true, // Flag to prevent adding extra classes to the badge container
    },
  ];

  return (
    // This container is now clean, inheriting its style from ProjectCard
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-slate-200 mb-2">Project Details</h4>
      {detailItems.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="text-slate-400 font-medium">{item.label}:</span>
          </div>
          {item.isBadge ? (
            item.value
          ) : (
            <span className={item.valueClass}>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}