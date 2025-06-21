// =====================================
// components/ProjectHeader.tsx
//
// Project header component with editing capabilities.
// Features:
// - Displays project title, description, and deadline
// - Allows editing project details
// - Handles project cancellation
// - Responsive layout (mobile and desktop)
// - Form validation
// - Loading states for async actions
// =====================================

import { Edit3, Save, X } from "lucide-react";
import { updateProjectDetails, cancelProject } from "../../services/projectService";
import { Project } from "../../types";
import { useState } from "react";

/**
 * Props interface for ProjectHeader
 * @property {Project} project - The project object
 * @property {boolean} isEditing - Whether editing mode is active
 * @property {Object} editForm - Current edit form values
 * @property {string} editForm.title - Project title in edit form
 * @property {string} editForm.description - Project description in edit form
 * @property {string} editForm.deadline - Project deadline in edit form
 * @property {React.Dispatch<React.SetStateAction<{title: string, description: string, deadline: string}>>} setEditForm - Setter for edit form
 * @property {React.Dispatch<React.SetStateAction<string | null>>} setEditingProject - Setter for editing project ID
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
interface ProjectHeaderProps {
  project: Project;
  isEditing: boolean;
  editForm: { title: string; description: string; deadline: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; deadline: string }>>;
  setEditingProject: React.Dispatch<React.SetStateAction<string | null>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * ProjectHeader component displays and manages project details.
 * Provides editing capabilities for title, description, and deadline.
 * @param {ProjectHeaderProps} props - Component props
 * @returns {React.ReactElement} Project header with editing controls
 */
export default function ProjectHeader({
  project,
  isEditing,
  editForm,
  setEditForm,
  setEditingProject,
  setToRefresh,
}: ProjectHeaderProps) {
  const [submitting, setSubmitting] = useState(false);
  
  /**
   * Determines if project can be edited based on its status
   * @param {Project} project - The project to check
   * @returns {boolean} True if project can be edited
   */
  const canEditProject = (project: Project) => {
    return project.status === "PENDING" || project.status === "IN_PROGRESS";
  };

  /**
   * Starts editing mode by initializing form with current values
   */
  const startEditing = () => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title,
      description: project.description,
      deadline: new Date(project.deadline).toISOString().slice(0, 16),
    });
  };

  /**
   * Cancels editing mode and resets form
   */
  const cancelEditing = () => {
    setEditingProject(null);
    setEditForm({ title: "", description: "", deadline: "" });
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Input change event
   */
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Saves project changes to the backend
   * - Validates form fields
   * - Only sends changed fields
   * - Triggers refresh on success
   */
  const saveProjectChanges = async () => {
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.deadline) {
      alert("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const updateData: { title?: string; description?: string; deadline?: string } = {};
      
      // Only include changed fields
      if (editForm.title !== project.title) updateData.title = editForm.title;
      if (editForm.description !== project.description) updateData.description = editForm.description;
      
      const currentDeadline = new Date(project.deadline).toISOString().slice(0, 16);
      if (editForm.deadline !== currentDeadline) updateData.deadline = editForm.deadline;

      if (Object.keys(updateData).length === 0) {
        cancelEditing();
        return;
      }

      await updateProjectDetails(project.id, updateData);
      setToRefresh?.((prev) => !prev);
      cancelEditing();
    } catch (err) {
      console.error("Failed to update project:", err);
      alert("Failed to update project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handles project cancellation with confirmation
   */
  const handleCancelProject = async () => {
    if (!confirm("Are you sure you want to cancel this project? This action cannot be undone.")) return;
    
    setSubmitting(true);
    try {
      await cancelProject(project.id);
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error("Failed to cancel project:", err);
      alert("Failed to cancel project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Base styling for icon buttons
  const iconButtonBase = "p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const iconButtonHover = "hover:bg-slate-700/60";

  return (
    /* Responsive layout container:
       - Mobile: Vertical stack (flex-col)
       - Desktop: Horizontal layout (md:flex-row)
    */
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
      {/* Content area - shows either edit form or display view */}
      <div className="flex-1 w-full md:mr-4">
        {isEditing ? (
          // Edit form
          <div className="space-y-4">
            {/* Title input with responsive font size */}
            <input
              name="title"
              value={editForm.title}
              onChange={handleEditFormChange}
              className="w-full bg-slate-800 text-slate-100 text-xl sm:text-2xl font-bold border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
              placeholder="Project title"
            />
            {/* Description textarea */}
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditFormChange}
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
              placeholder="Project description"
            />
            {/* Deadline input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Deadline:</label>
              <input
                name="deadline"
                type="datetime-local"
                value={editForm.deadline}
                onChange={handleEditFormChange}
                className="w-full max-w-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none dark-datetime-input"
              />
            </div>
          </div>
        ) : (
          // Display view
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 break-words">{project.title}</h3>
            <p className="text-slate-400 leading-relaxed break-words">{project.description}</p>
          </div>
        )}
      </div>

      {/* Action buttons - changes based on edit mode */}
      <div className="flex items-center gap-2 self-start md:self-auto">
        {isEditing ? (
          // Edit mode buttons
          <>
            <button
              onClick={saveProjectChanges}
              disabled={submitting}
              className={`${iconButtonBase} text-emerald-400 ${!submitting && "hover:bg-emerald-500/20"}`}
              title={submitting ? "Saving..." : "Save changes"}
            >
              <Save size={20} strokeWidth={2.5} className={submitting ? "animate-pulse" : ""} />
            </button>
            <button
              onClick={cancelEditing}
              disabled={submitting}
              className={`${iconButtonBase} text-slate-400 ${iconButtonHover}`}
              title="Cancel editing"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          // View mode buttons (only shown if project can be edited)
          canEditProject(project) && (
            <>
              <button
                onClick={startEditing}
                className={`${iconButtonBase} text-cyan-400 ${iconButtonHover}`}
                title="Edit project"
              >
                <Edit3 size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={handleCancelProject}
                disabled={submitting}
                className={`${iconButtonBase} text-red-500 ${!submitting && "hover:bg-red-500/20"}`}
                title="Cancel project"
              >
                <X size={20} strokeWidth={2.5} className={submitting ? "animate-pulse" : ""} />
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}