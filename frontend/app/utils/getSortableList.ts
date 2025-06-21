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
        // Sort by budget in descending order
        return parseFloat((b as any).budget) - parseFloat((a as any).budget);

      case "deadline":
        // Sort by nearest deadline (earliest first)
        return (
          new Date((a as any).deadline).getTime() -
          new Date((b as any).deadline).getTime()
        );

      case "recency":
        // Sort by creation date (most recent first)
        return (b as any).createdAt?.localeCompare((a as any).createdAt) ?? 0;

      case "status":
        // Define custom sort order for project statuses
        const statusOrder: Record<string, number> = {
          PENDING: 0,
          IN_PROGRESS: 1,
          CHANGES_REQUESTED: 2,
          COMPLETED: 3,
          CANCELLED: 4
        };
        return (
          statusOrder[(a as any).status] - statusOrder[(b as any).status]
        );

      case "alphabetical":
        // Sort alphabetically by project title
        return (a as any).title?.localeCompare((b as any).title) ?? 0;

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
