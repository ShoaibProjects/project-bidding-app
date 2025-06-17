import { Project, Bid } from "../types/index"; // adjust as needed

type EntityType = "project" | "bid";

// You can restrict `sortOption` to your specific allowed strings
export function getSortableList<T extends Project | Bid>(
  items: T[],
  sortOption: string,
  entityType: EntityType
): T[] {
  const list = [...items]; // avoid mutating original array

  return list.sort((a, b) => {
    switch (sortOption) {
      case "budget":
        return parseFloat((b as any).budget) - parseFloat((a as any).budget);

      case "deadline":
        return (
          new Date((a as any).deadline).getTime() -
          new Date((b as any).deadline).getTime()
        );

      case "recency":
        return (b as any).createdAt?.localeCompare((a as any).createdAt) ?? 0;

      case "status":
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
        return (a as any).title?.localeCompare((b as any).title) ?? 0;

      case "sellerRating":
        if (entityType === "bid") {
          const aRating = (a as Bid).seller?.rating ?? 0;
          const bRating = (b as Bid).seller?.rating ?? 0;
          return bRating - aRating;
        }
        return 0;

      default:
        return 0;
    }
  });
}
