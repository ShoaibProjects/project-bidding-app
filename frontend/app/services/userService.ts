import API from "./api";

/**
 * Submits a rating for a seller after project completion.
 *
 * @param data - Object containing:
 *  - value: Rating score (e.g., 1 to 5)
 *  - comment: Optional feedback about the seller
 *  - projectId: ID of the project associated with the rating
 * @returns Promise resolving to the created rating
 */
export const rateSeller = (data: {
  value: number;
  comment?: string;
  projectId: string;
}) => API.post("/api/users", data);

/**
 * Fetches public user profile information by user ID.
 *
 * @param userId - The ID of the user to retrieve
 * @returns Promise resolving to user info excluding password
 */
export const getUserById = (userId: string) =>
  API.get(`/api/users/${userId}`);