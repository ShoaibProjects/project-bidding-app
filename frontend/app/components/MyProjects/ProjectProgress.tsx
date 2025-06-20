// =====================================
// components/ProjectProgress.tsx
// =====================================
import { Project } from "../../types";

interface ProjectProgressProps {
  project: Project;
}

export default function ProjectProgress({ project }: ProjectProgressProps) {
  const progress = project.progress ?? 0;

  // A more modern, gradient-based color palette for dark mode
  const progressColor = 
    progress >= 75 ? 'bg-gradient-to-r from-teal-400 to-green-500' : 
    progress >= 50 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 
    progress >= 25 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                     'bg-gradient-to-r from-red-500 to-rose-600';

  return (
    // Main component card with modern dark-mode styling
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80 shadow-lg">
      
      {/* Header section with improved typography */}
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-gray-400">Project Progress</span>
        <span className="text-xl font-bold text-white">{progress}%</span>
      </div>

      {/* Progress bar container with a darker track for contrast */}
      <div className="w-full bg-gray-900/70 rounded-full h-2.5 overflow-hidden">
        
        {/* The progress indicator with enhanced colors and smoother transitions */}
        <div 
          className={`h-2.5 rounded-full ${progressColor} transition-all duration-500 ease-in-out`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Project progress"
        ></div>
      </div>
    </div>
  );
}