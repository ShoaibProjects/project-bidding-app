// =====================================
// components/ProjectCard.tsx
//
// Main project card component that aggregates all project-related sections.
// Features:
// - Responsive layout with two-column design for active projects
// - Editing capabilities for project details
// - Integrated sections for bids, deliverables, and ratings
// - Dynamic styling based on project status
// - Smooth hover effects and transitions
// =====================================

import { useState } from "react";
import { Project } from "../../types";
import { getSortableList } from "../../utils/getSortableList";
import ProjectHeader from "./ProjectHeader";
import ProjectDetails from "./ProjectDetails";
import ProjectProgress from "./ProjectProgress";
import DeliverableSection from "./DeliverableSection";
import BidsSection from "./BidsSection";
import SelectedBidSection from "./SelectedBidSection";
import RatingSection from "./RatingSection";

/**
 * Type definition for bid sorting options
 * @typedef {"rating" | "budget" | "deadline" | "recency"} BidSortOption
 */
type BidSortOption = "rating" | "budget" | "deadline" | "recency";

/**
 * Props interface for ProjectCard component
 * @property {Project} project - The project object to display
 * @property {BidSortOption} bidSortOption - Current bid sorting option
 * @property {(option: BidSortOption) => void} setBidSortOption - Function to update bid sorting
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
interface ProjectCardProps {
  project: Project;
  bidSortOption: BidSortOption;
  setBidSortOption: (option: BidSortOption) => void;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * ProjectCard is the main container component for displaying project information.
 * It combines multiple sub-components into a cohesive card with responsive layout.
 * @param {ProjectCardProps} props - Component props
 * @returns {React.ReactElement} A complete project card with all sections
 */
export default function ProjectCard({
  project,
  bidSortOption,
  setBidSortOption,
  setToRefresh,
}: ProjectCardProps) {
  // State for managing edit mode
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  // State for rating inputs
  const [ratingInputs, setRatingInputs] = useState<number>(0);
  const [ratingComments, setRatingComments] = useState<string>("");

  const isEditing = editingProject === project.id;
  const sortedBids = getSortableList(project.bids || [], bidSortOption, "bid");

  /**
   * Determines if the two-column layout should be used
   * Only applies to active projects (not PENDING or CANCELLED)
   */
  const useTwoColumnLayout = !(project.status === "PENDING" || project.status === "CANCELLED");

  return (
    // Main card container with modern styling
    <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-md transition-all duration-300 hover:shadow-cyan-500/10 hover:shadow-lg relative overflow-hidden">
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      
      {/* Content container with responsive padding */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Project header with edit capabilities */}
        <ProjectHeader
          project={project}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          setEditingProject={setEditingProject}
          setToRefresh={setToRefresh}
        />

        {/* Only show content when not in edit mode */}
        {!isEditing && (
          <>
            {/* Responsive grid section */}
            <div className={`grid ${useTwoColumnLayout ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4 md:gap-6 lg:gap-8`}>
              
              {/* Left column - Project details and progress */}
              <div className="bg-slate-800/50 p-4 lg:p-6 rounded-lg border border-slate-700/80 space-y-4 flex flex-col">
                <ProjectDetails project={project} />
                {/* Only show progress for active projects */}
                {(project.status === "IN_PROGRESS") && <ProjectProgress project={project} />}
              </div>

              {/* Right column - Deliverables (conditionally rendered) */}
              {useTwoColumnLayout && (
                <div className="bg-slate-800/50 p-4 lg:p-6 rounded-lg border border-slate-700/80 space-y-4 flex flex-col">
                  <DeliverableSection
                    project={project}
                    setToRefresh={setToRefresh}
                  />
                </div>
              )}
            </div>
            
            {/* Section divider with responsive spacing */}
            <hr className="border-t border-slate-700/80 !my-6 md:!my-8" />
            
            {/* Bottom section - Bids, selected bid, and ratings */}
            <div className="space-y-8">
              {/* Bids list with sorting controls */}
              <BidsSection
                project={project}
                sortedBids={sortedBids}
                bidSortOption={bidSortOption}
                setBidSortOption={setBidSortOption}
                setToRefresh={setToRefresh}
              />

              {/* Selected bid information */}
              <SelectedBidSection
                project={project}
                setToRefresh={setToRefresh}
              />

              {/* Rating section for completed projects */}
              <RatingSection
                project={project}
                ratingInputs={ratingInputs}
                setRatingInputs={setRatingInputs}
                ratingComments={ratingComments}
                setRatingComments={setRatingComments}
                setToRefresh={setToRefresh}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}