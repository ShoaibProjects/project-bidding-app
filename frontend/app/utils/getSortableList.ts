import { Project, Bid } from "../types/index"; // adjust as needed

// Type of entities the list can contain
type EntityType = "project" | "bid";

/**
 * Returns a sorted copy of the given items array based on the provided sort option.
 * Supports sorting for both 'project' and 'bid' entities.
 *
 * @param items - Array of Project or Bid objects to sort
 * @param sortOption - The criteria by which to sort the list (e.g., 'budget', 'deadline')
 * @param entityType - Specifies whether the array contains 'project' or 'bid' items
 * @returns A new sorted array of the same type as the input
 */
export function getSortableList<T extends Project | Bid>(
  items: T[],
  sortOption: string,
  entityType: EntityType
): T[] {
  const list = [...items]; // Create a shallow copy to avoid mutating the original array

  return list.sort((a, b) => {
    switch (sortOption) {
      case "budget":
        // Type guard to ensure we're working with Projects or Bids that have a budget
        if ('budget' in a && 'budget' in b) {
          // Sort by budget in descending order
          return parseFloat(String(b.budget)) - parseFloat(String(a.budget));
        }
        return 0;

      case "deadline":
        // Type guard to ensure we're working with Projects that have a deadline
        if (entityType === "project" && 'deadline' in a && 'deadline' in b) {
          // Sort by nearest deadline (earliest first)
          return (
            new Date((a as Project).deadline).getTime() -
            new Date((b as Project).deadline).getTime()
          );
        }
        return 0;

      case "recency":
        // Type guard for createdAt property
        if ('createdAt' in a && a.createdAt && 'createdAt' in b && b.createdAt) {
          // Sort by creation date (most recent first)
          return b.createdAt.localeCompare(a.createdAt);
        }
        return 0;

      case "status":
        // Define custom sort order for project statuses
        const statusOrder: Record<string, number> = {
          PENDING: 0,
          IN_PROGRESS: 1,
          CHANGES_REQUESTED: 2,
          COMPLETED: 3,
          CANCELLED: 4
        };
        // Type guard for status property, assuming it's on Project
        if (entityType === "project" && 'status' in a && 'status' in b) {
          return (
            statusOrder[(a as Project).status] - statusOrder[(b as Project).status]
          );
        }
        return 0;

      case "alphabetical":
        // Type guard for title property, assuming it's on Project
        if (entityType === "project" && 'title' in a && a.title && 'title' in b && b.title) {
          // Sort alphabetically by project title
          return a.title.localeCompare(b.title);
        }
        return 0;

      case "sellerRating":
        // Sort bids by seller's rating (highest first)
        if (entityType === "bid") {
          const aRating = (a as Bid).seller?.rating ?? 0;
          const bRating = (b as Bid).seller?.rating ?? 0;
          return bRating - aRating;
        }
        return 0;

      default:
        // No sorting applied for unknown option
        return 0;
    }
  });
}