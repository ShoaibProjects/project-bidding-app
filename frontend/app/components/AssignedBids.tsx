"use client";

import { useEffect, useState } from "react";
import {
  getSelectedProjectsForSeller,
  reuploadDeliverable,
  updateProjectProgress,
} from "../services/projectService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";
import UploadDeliverable from "./UploadDeliverable";
import {
  ExternalLink,
  Pencil,
  Loader2,
  AlertTriangle,
  Star,
  FileUp,
  FileCheck2,
  RefreshCcw,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Calendar,
  Inbox,
  FileClock,
  User,
  ListFilter,
  Eye,
} from "lucide-react";
import { getSortableList } from "../utils/getSortableList";

/**
 * Type definition for sort options
 * @typedef {"budget" | "deadline" | "recency" | "status" | "alphabetical"} SortOption
 */
type SortOption =
  | "budget"
  | "deadline"
  | "recency"
  | "status"
  | "alphabetical";

/**
 * StatusBadge component renders a styled badge indicating project status
 * @param {Object} props - Component props
 * @param {string} props.status - The status value to display
 * @returns {React.ReactElement} A styled status badge with icon
 */
const StatusBadge = ({ status }: { status: string }) => {
    // Mapping of status values to their display configurations
    const statusStyles: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
        IN_PROGRESS: {
            icon: <RefreshCcw className="w-3 h-3" />,
            label: "In Progress",
            className: "bg-blue-900/50 text-blue-300 border-blue-500/30",
        },
        COMPLETED: {
            icon: <CheckCircle2 className="w-3 h-3" />,
            label: "Completed",
            className: "bg-green-900/50 text-green-300 border-green-500/30",
        },
        IN_REVIEW: {
            icon: <Eye className="w-3 h-3" />, 
            label: "In Review",
            className: "bg-purple-900/50 text-purple-300 border-purple-500/30",
        },
        CHANGES_REQUESTED: {
            icon: <AlertTriangle className="w-3 h-3" />,
            label: "Changes Requested",
            className: "bg-yellow-900/50 text-yellow-300 border-yellow-500/30",
        },
        PENDING: {
            icon: <FileClock className="w-3 h-3" />,
            label: "Pending",
            className: "bg-gray-700 text-gray-400 border-gray-600",
        },
    };

    // Get the style configuration for the current status, default to PENDING if not found
    const style = statusStyles[status] || statusStyles["PENDING"];

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style.className}`}>
            {style.icon}
            <span>{style.label}</span>
        </div>
    );
};

/**
 * AssignedProjectList Component
 * 
 * Displays a list of projects assigned to the logged-in seller with a modern dark-mode UI.
 * Allows uploading/re-uploading deliverables and updating project progress.
 * Shows project details, status, buyer info, and ratings if completed.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.toRefresh - Flag to trigger data refresh
 * @param {React.Dispatch<React.SetStateAction<boolean>>} [props.setToRefresh] - Optional setter to update refresh flag
 * @returns {React.ReactElement} The assigned projects list component
 */
export default function AssignedProjectList({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("recency");
  const sortedProjects = getSortableList(projects, sortOption, "project");
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  
  // State for managing editable progress
  const [editProjectIdMap, setEditProjectIdMap] = useState<Record<string, boolean>>({});
  const [editedProgressMap, setEditedProgressMap] = useState<Record<string, number>>({});
  const [selectedFileMap, setSelectedFileMap] = useState<Record<string, File | null>>({});

  // Fetch projects when user ID changes or refresh is triggered
  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id, toRefresh]);

  /**
   * Custom styles for the progress range input to look good in dark mode
   * @returns {React.ReactElement} Style tag with custom range input styling
   */
  const RangeInputStyle = () => (
    <style>{`
        .progress-range { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: #374151; border-radius: 9999px; outline: none; transition: opacity 0.2s; }
        .progress-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #38bdf8; border-radius: 9999px; cursor: pointer; border: 3px solid #1f2937; }
        .progress-range::-moz-range-thumb { width: 20px; height: 20px; background: #38bdf8; border-radius: 9999px; cursor: pointer; border: 3px solid #1f2937; }
    `}</style>
  );

  /**
   * Fetches projects assigned to the current seller
   * @param {string} sellerId - The ID of the current seller
   */
  const fetchProjects = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await getSelectedProjectsForSeller(sellerId);
      setProjects(res.data);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch assigned projects", err);
      setError("Failed to load assigned projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * SortSelector component provides a styled dropdown for sorting options
   * @param {Object} props - Component props
   * @param {SortOption} props.selected - Currently selected sort option
   * @param {(value: SortOption) => void} props.onChange - Handler for sort option change
   * @returns {React.ReactElement} A styled select dropdown for sorting
   */
  const SortSelector = ({
    selected,
    onChange,
  }: {
    selected: SortOption;
    onChange: (value: SortOption) => void;
  }) => {
    // Mapping of sort options to their display labels
    const sortOptions: Record<SortOption, string> = {
      recency: "Recency",
      status: "Status",
      deadline: "Deadline",
      budget: "Budget",
      alphabetical: "Alphabetical",
    };

    return (
      <div className="relative">
        <select
          id="sort"
          value={selected}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none bg-gray-800 border border-gray-700 rounded-md pl-4 pr-10 py-2 text-sm font-medium text-gray-300 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-colors"
        >
          {Object.entries(sortOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-gray-500 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-6 lg:p-8">
      <RangeInputStyle />
      <div className="max-w-7xl mx-auto">
        {/* Header section with title and sort controls */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileCheck2 className="w-8 h-8 text-sky-400" />
              Assigned Projects
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your active and completed projects.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-gray-500" />
            <SortSelector selected={sortOption} onChange={setSortOption} />
          </div>
        </header>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center gap-3 text-gray-400 py-20">
            <Loader2 className="animate-spin w-6 h-6 text-sky-500" />
            <span className="text-lg">Loading Projects...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/30 text-red-300 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">
              No Assigned Projects
            </h3>
            <p className="text-gray-400 mt-1">
              Your assigned projects will appear here once you&apos;re selected by a
              buyer.
            </p>
          </div>
        )}

        {/* Projects list */}
        <div className="grid grid-cols-1 gap-6">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10 flex flex-col"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                      {project.description}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />{" "}
                    <span className="font-medium text-gray-300">
                      {project.buyer?.email}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />{" "}
                    <span className="font-medium text-gray-300">
                      ${project.budget}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />{" "}
                    <span className="font-medium text-gray-300">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="px-6 pt-4 pb-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium flex items-center gap-2 text-sky-300">
                    <RefreshCcw className="w-4 h-4" />
                    Progress:
                    <span className="font-bold text-white text-base ml-1">
                      {editProjectIdMap[project.id]
                        ? editedProgressMap[project.id] ?? project.progress ?? 0
                        : project.progress ?? 0}
                      %
                    </span>
                  </p>
                  {!editProjectIdMap[project.id] && (
                    <button
                      onClick={() =>
                        setEditProjectIdMap({
                          ...editProjectIdMap,
                          [project.id]: true,
                        })
                      }
                      className="text-sky-400 hover:text-sky-300 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>
                {!editProjectIdMap[project.id] ? (
                  // Display mode for progress
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all"
                      style={{ width: `${project.progress ?? 0}%` }}
                    />
                  </div>
                ) : (
                  // Edit mode for progress
                  <>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={
                        editedProgressMap[project.id] ?? project.progress ?? 0
                      }
                      onChange={(e) =>
                        setEditedProgressMap({
                          ...editedProgressMap,
                          [project.id]: parseInt(e.target.value),
                        })
                      }
                      className="w-full mt-2 progress-range"
                    />
                    <div className="flex justify-end mt-4 gap-3">
                      <button
                        onClick={() =>
                          setEditProjectIdMap({
                            ...editProjectIdMap,
                            [project.id]: false,
                          })
                        }
                        className="px-4 py-2 bg-gray-700 text-sm font-semibold text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const newProgress = editedProgressMap[project.id];
                          try {
                            await updateProjectProgress(
                              project.id,
                              newProgress
                            );
                            setToRefresh?.(!toRefresh);
                            setEditProjectIdMap({
                              ...editProjectIdMap,
                              [project.id]: false,
                            });
                          } catch (err) {
                            console.error("Failed to update progress", err);
                          }
                        }}
                        className="px-4 py-2 bg-sky-600 text-sm font-semibold text-white rounded-md hover:bg-sky-500 transition-colors flex items-center gap-2"
                      >
                        Save Progress
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Deliverable & Ratings Footer */}
              <div className="bg-gray-800/50 border-t border-gray-700/50 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {project.deliverable ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <FileCheck2 className="w-5 h-5" />
                        <span>Deliverable Uploaded</span>
                      </div>
                      <a
                        href={project.deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-1.5 text-sm"
                      >
                        View File <ExternalLink size={14} />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <FileUp className="w-5 h-5" />
                      <span className="font-semibold text-sm">
                        No deliverable uploaded yet
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating display for completed projects */}
                {project.status === "COMPLETED" && project.rating && (
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-medium text-gray-300">
                      Rating:
                    </strong>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            (project.rating?.value ?? 0) >= star
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                          fill={
                            (project.rating?.value ?? 0) >= star
                              ? "#facc15"
                              : "currentColor"
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload/Re-upload Section - shown conditionally */}
              {(project.status === "CHANGES_REQUESTED" ||
                !project.deliverable) &&
                setToRefresh && (
                  <div className="px-6 py-5 bg-gray-900/40 border-t border-gray-700/50 rounded-b-xl">
                    {project.status === "CHANGES_REQUESTED" && (
                      <div className="flex items-center gap-2 text-yellow-300 bg-yellow-900/40 border border-yellow-500/30 p-3 rounded-md mb-4">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                          The buyer has requested changes. Please upload a new
                          version of the deliverable.
                        </p>
                      </div>
                    )}

                    {project.deliverable ? (
                      <label className="text-sm font-medium text-gray-200 flex items-center gap-2 mb-2">
                        <FileUp className="w-4 h-4" /> Re-upload Deliverable:
                      </label>
                    ) : (
                      <p className="font-semibold text-white mb-2">
                        Upload Deliverable
                      </p>
                    )}

                    {/* Initial upload component */}
                    {!project.deliverable && setToRefresh && (
                      <UploadDeliverable
                        projectId={project.id}
                        toRefresh={toRefresh}
                        setToRefresh={setToRefresh}
                      />
                    )}

                    {/* Re-upload section */}
                    {project.deliverable && setToRefresh && (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="file"
                          accept=".jpg,.png,.mp4"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setSelectedFileMap({
                              ...selectedFileMap,
                              [project.id]: file,
                            });
                          }}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-sky-300 hover:file:bg-gray-600 transition-colors cursor-pointer"
                        />
                        <button
                          onClick={async () => {
                            const fileToUpload = selectedFileMap[project.id];
                            if (!fileToUpload) return;

                            try {
                              setImgLoading(true)
                              await reuploadDeliverable(project.id, fileToUpload);
                              setToRefresh(!toRefresh);
                              setSelectedFileMap({
                                ...selectedFileMap,
                                [project.id]: null,
                              });
                              setImgLoading(false)
                            } catch (err) {
                              console.error(
                                "Failed to re-upload deliverable",
                                err
                              );
                            }
                          }}
                          disabled={!selectedFileMap[project.id] || imgLoading}
                          className="w-full sm:w-auto flex-shrink-0 px-5 py-2.5 bg-sky-600 text-sm font-semibold text-white rounded-full hover:bg-sky-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                          {!imgLoading?('Upload'):(
                        <Loader2 className="h-5 w-5 animate-spin" />)}
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}