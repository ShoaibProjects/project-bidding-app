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

/**
 * Updates the authenticated user's profile.
 * Sends name, description, and profileImage (as File).
 *
 * @param data - Object containing:
 *  - name: Optional updated name
 *  - description: Optional updated description
 *  - profileImage: Optional File object (not URL)
 * @returns Promise resolving to the updated user
 */

/**
 * Updates the authenticated user's profile info (name and/or description).
 *
 * @param data - Object containing:
 *  - name?: string
 *  - description?: string
 * @returns Promise resolving to the updated user
 */
export const updateUserProfileInfo = (data: {
  name?: string;
  description?: string;
}) => API.patch(`/api/users/update/info`, data);

/**
 * Updates the authenticated user's profile image.
 *
 * @param formData - FormData containing:
 *  - profileImage: File object (e.g., from input type="file")
 * @returns Promise resolving to the updated user
 */
export const updateUserProfileImage = (formData: FormData) =>
  API.patch(`/api/users/update/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });