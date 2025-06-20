// =====================================
// components/ProjectHeader.tsx
// =====================================

import { Edit3, Save, X } from "lucide-react";
import { updateProjectDetails, cancelProject } from "../../services/projectService";
import { Project } from "../../types";

interface ProjectHeaderProps {
  project: Project;
  isEditing: boolean;
  editForm: { title: string; description: string; deadline: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; deadline: string }>>;
  setEditingProject: React.Dispatch<React.SetStateAction<string | null>>;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProjectHeader({
  project,
  isEditing,
  editForm,
  setEditForm,
  setEditingProject,
  submitting,
  setSubmitting,
  setToRefresh,
}: ProjectHeaderProps) {
  const canEditProject = (project: Project) => {
    return project.status === "PENDING" || project.status === "IN_PROGRESS";
  };

  const startEditing = () => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title,
      description: project.description,
      deadline: new Date(project.deadline).toISOString().slice(0, 16),
    });
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditForm({ title: "", description: "", deadline: "" });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProjectChanges = async () => {
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.deadline) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      const updateData: { title?: string; description?: string; deadline?: string } = {};
      
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

  const handleCancelProject = async () => {
    const confirmed = confirm(
      "Are you sure you want to cancel this project? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await cancelProject(project.id);
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error("Failed to cancel project:", err);
      alert("Failed to cancel project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Base classes for icon buttons for a consistent, modern look
  const iconButtonBase = "p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent";
  const iconButtonHover = "hover:bg-slate-700/60";

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1 mr-4">
        {isEditing ? (
          <div className="space-y-4">
            <input
              name="title"
              value={editForm.title}
              onChange={handleEditFormChange}
              className="w-full bg-slate-800 text-slate-100 text-2xl font-bold border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
              placeholder="Project title"
            />
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditFormChange}
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
              placeholder="Project description"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Deadline:</label>
              <input
                name="deadline"
                type="datetime-local"
                value={editForm.deadline}
                onChange={handleEditFormChange}
                className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none dark-datetime-input"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-100">{project.title}</h3>
            <p className="text-slate-400 leading-relaxed">{project.description}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        {isEditing ? (
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
                <X size={20} strokeWidth={2.5} />
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}