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
 * Marks a project as completed.
 * @param projectId - ID of the project to mark complete
 * @returns Promise confirming the completion
 */
export const completeProject = (projectId: string) =>
  API.post(`/api/projects/${projectId}/complete`);

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
 * Uploads a deliverable file for a project.
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
