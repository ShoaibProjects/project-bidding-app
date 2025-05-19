import API from "./api";
import { NewProject } from "../types";

export const createProject = (data: NewProject) => API.post("/api/projects", data);

export const getProjects = () => API.get("/api/projects");

export const selectSeller = (projectId: string, bidId: string) =>
  API.post(`/api/projects/${projectId}/select-seller/${bidId}`);

// export const completeProject = (projectId: string, fileUrl: string) =>
//   API.post(`/api/projects/${projectId}/complete`, { fileUrl });

export const completeProject = (projectId: string) =>
  API.post(`/api/projects/${projectId}/complete`);

// ✅ Get selected projects for a seller
export const getSelectedProjectsForSeller = (sellerId: string) =>
  API.get(`/api/projects/selected-projects/seller/${sellerId}`);

// ✅ Get projects by buyer ID
export const getProjectsByBuyerId = (buyerId: string) =>
  API.get(`/api/projects/buyer/${buyerId}`);

// ✅ Get project by project ID
export const getProjectByProjectId = (projectId: string) =>
  API.get(`/api/projects/${projectId}`);

// ✅ Upload deliverable (requires FormData with a file)
export const uploadDeliverable = (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("deliverable", file);

  return API.post(`/api/projects/${projectId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
