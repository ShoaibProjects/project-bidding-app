import API from "./api"; // Axios instance with base URL and interceptors
import { NewProject } from "../types"; // Type definition for creating a new project

/**
 * Creates a new project.
 * @param data - Object containing project details (title, description, buyerId, etc.)
 * @returns Promise resolving to the created project
 */
export const createProject = (data: NewProject) => API.post("/api/projects", data);

/**
 * Fetches all available projects.
 * @returns Promise resolving to an array of projects
 */
export const getProjects = () => API.get("/api/projects");

/**
 * Selects a seller for a specific project based on a bid.
 * @param projectId - ID of the project
 * @param bidId - ID of the selected bid
 * @returns Promise confirming the seller selection
 */
export const selectSeller = (projectId: string, bidId: string) =>
  API.post(`/api/projects/${projectId}/select-seller/${bidId}`);

/**
 * Unselects a previously selected seller from a project.
 * Resets project status to "PENDING" and clears selected bid.
 * @param projectId - ID of the project
 * @returns Promise confirming the unselection
 */
export const unselectSeller = (projectId: string) =>
  API.post(`/api/projects/${projectId}/unselect-seller`);

/**
 * Marks a project as completed.
 * @param projectId - ID of the project to mark complete
 * @returns Promise confirming the completion
 */
export const completeProject = (projectId: string) =>
  API.post(`/api/projects/${projectId}/complete`);

/**
 * Cancels a project.
 * Only the buyer who created the project can cancel it.
 * Sends notification emails to the selected seller (if any) and buyer.
 * @param projectId - ID of the project to cancel
 * @returns Promise confirming the cancellation
 */
export const cancelProject = (projectId: string) =>
  API.post(`/api/projects/${projectId}/cancel`);

/**
 * Fetches projects for which a seller has been selected.
 * @param sellerId - ID of the seller
 * @returns Promise resolving to selected projects for the seller
 */
export const getSelectedProjectsForSeller = (sellerId: string) =>
  API.get(`/api/projects/selected-projects/seller/${sellerId}`);

/**
 * Fetches all projects created by a specific buyer.
 * @param buyerId - ID of the buyer
 * @returns Promise resolving to projects posted by the buyer
 */
export const getProjectsByBuyerId = (buyerId: string) =>
  API.get(`/api/projects/buyer/${buyerId}`);

/**
 * Fetches detailed information about a specific project.
 * @param projectId - ID of the project
 * @returns Promise resolving to the project details
 */
export const getProjectByProjectId = (projectId: string) =>
  API.get(`/api/projects/${projectId}`);

/**
 * Updates project details (title, description, deadline).
 * Only the buyer who created the project can update it.
 * @param projectId - ID of the project
 * @param data - Object containing updated project details
 * @returns Promise resolving to the updated project
 */
export const updateProjectDetails = (projectId: string, data: { title?: string; description?: string; deadline?: string }) =>
  API.patch(`/api/projects/${projectId}`, data);

/**
 * Uploads a deliverable file for a project (triggers status to "IN_REVIEW").
 * @param projectId - ID of the project
 * @param file - File to be uploaded (e.g. PDF, ZIP, DOCX, etc.)
 * @returns Promise confirming successful upload
 */
export const uploadDeliverable = (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("deliverable", file); // Append file to FormData

  return API.post(`/api/projects/${projectId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Set content type for file upload
    },
  });
};

/**
 * Request changes for a deliverable (status → CHANGES_REQUESTED).
 * @param projectId - ID of the project
 * @returns Promise confirming the changes request
 */
export const requestChanges = (projectId: string) =>
  API.patch(`/api/projects/${projectId}/request-changes`);

/**
 * Re-upload revised deliverable after changes requested.
 * @param projectId - ID of the project
 * @param file - Revised file to be uploaded
 * @returns Promise confirming successful re-upload
 */
export const reuploadDeliverable = (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("deliverable", file);

  return API.post(`/api/projects/${projectId}/reupload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Update the progress percentage of a project.
 * @param projectId - ID of the project
 * @param progress - Progress percentage (0-99)
 * @returns Promise confirming the progress update
 */
export const updateProjectProgress = (projectId: string, progress: number) =>
  API.patch(`/api/projects/${projectId}/progress`, { progress });