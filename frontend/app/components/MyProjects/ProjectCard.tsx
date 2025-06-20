// =====================================
// components/ProjectCard.tsx
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

type BidSortOption = "rating" | "budget" | "deadline" | "recency";

interface ProjectCardProps {
  project: Project;
  bidSortOption: BidSortOption;
  setBidSortOption: (option: BidSortOption) => void;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProjectCard({
  project,
  bidSortOption,
  setBidSortOption,
  setToRefresh,
}: ProjectCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [ratingInputs, setRatingInputs] = useState<number>(0);
  const [ratingComments, setRatingComments] = useState<string>("");

  const isEditing = editingProject === project.id;
  const sortedBids = getSortableList(project.bids || [], bidSortOption, "bid");

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-md transition-all duration-300 hover:shadow-cyan-500/10 hover:shadow-lg relative overflow-hidden">
      {/* Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      
      <div className="p-6 md:p-8 space-y-6">
        <ProjectHeader
          project={project}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          setEditingProject={setEditingProject}
          submitting={submitting}
          setSubmitting={setSubmitting}
          setToRefresh={setToRefresh}
        />

        {!isEditing && (
          <>
            <div className={`grid grid-cols-1 ${(!(project.status === "PENDING" || project.status === "CANCELLED") && `md:grid-cols-2`)} gap-6`}>
              {/* Project Details & Progress Section */}
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/80 space-y-4">
                <ProjectDetails project={project} />
                {(project.status === "IN_PROGRESS") && <ProjectProgress project={project} />}
              </div>

              {/* Deliverables Section */}
              {!(project.status === "PENDING" || project.status === "CANCELLED") && (
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/80 space-y-4">
                  <DeliverableSection
                    project={project}
                    submitting={submitting}
                    setSubmitting={setSubmitting}
                    setToRefresh={setToRefresh}
                  />
                </div>
              )}
            </div>
            
            {/* Divider */}
            <hr className="border-t border-slate-700/80 !my-8" />
            
            <div className="space-y-8">
              <BidsSection
                project={project}
                sortedBids={sortedBids}
                bidSortOption={bidSortOption}
                setBidSortOption={setBidSortOption}
                submitting={submitting}
                setSubmitting={setSubmitting}
                setToRefresh={setToRefresh}
              />

              <SelectedBidSection
                project={project}
                submitting={submitting}
                setSubmitting={setSubmitting}
                setToRefresh={setToRefresh}
              />

              <RatingSection
                project={project}
                ratingInputs={ratingInputs}
                setRatingInputs={setRatingInputs}
                ratingComments={ratingComments}
                setRatingComments={setRatingComments}
                submitting={submitting}
                setSubmitting={setSubmitting}
                setToRefresh={setToRefresh}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}