// =====================================
// components/ProjectProgress.tsx
//
// Visual progress indicator component for projects.
// Features:
// - Dynamic color gradients based on progress percentage
// - Accessible progress bar with ARIA attributes
// - Modern dark mode styling with backdrop blur
// - Smooth transition animations
// =====================================

import { Project } from "../../types";

/**
 * Props interface for ProjectProgress component
 * @property {Project} project - The project object containing progress data
 */
interface ProjectProgressProps {
  project: Project;
}

/**
 * ProjectProgress component displays a visual representation of project completion percentage.
 * The progress bar changes color gradient based on completion percentage ranges.
 * @param {ProjectProgressProps} props - Component props
 * @returns {React.ReactElement} A styled progress indicator card
 */
export default function ProjectProgress({ project }: ProjectProgressProps) {
  // Default to 0 if progress is undefined
  const progress = project.progress ?? 0;

  /**
   * Determines the gradient color based on progress percentage
   * - 75-100%: Teal to Green (success range)
   * - 50-74%: Cyan to Blue (good progress)
   * - 25-49%: Amber to Orange (moderate progress)
   * - 0-24%: Red to Rose (needs attention)
   */
  const progressColor = 
    progress >= 75 ? 'bg-gradient-to-r from-teal-400 to-green-500' : 
    progress >= 50 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 
    progress >= 25 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                     'bg-gradient-to-r from-red-500 to-rose-600';

  return (
    // Main container with modern dark mode styling
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80 shadow-lg">
      
      {/* Header section with progress percentage */}
      <div className="flex justify-between items-baseline mb-2">
        {/* Label with subtle styling */}
        <span className="text-sm font-medium text-gray-400">Project Progress</span>
        {/* Percentage value with emphasis */}
        <span className="text-xl font-bold text-white">{progress}%</span>
      </div>

      {/* Progress bar container */}
      <div className="w-full bg-gray-900/70 rounded-full h-2.5 overflow-hidden">
        
        {/* 
          Actual progress indicator with:
          - Dynamic color gradient based on progress
          - Smooth width transitions
          - Full accessibility support
        */}
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