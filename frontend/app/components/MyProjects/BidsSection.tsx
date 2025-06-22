// =====================================
// components/BidsSection.tsx
//
// Displays and manages project bids with sorting functionality
// Features:
// - Sortable list of bids with multiple criteria
// - Seller selection capability
// - Responsive grid layout
// - Loading states for async actions
// =====================================

import { useState } from "react";
import { selectSeller } from "../../services/projectService";
import { Project, Bid } from "../../types";
import { currencySymbols } from "../ProjectForm";
import SortSelector from "./SortSelector";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Type definition for bid sorting options
 * @typedef {"rating" | "budget" | "deadline" | "recency"} BidSortOption
 */
type BidSortOption = "rating" | "budget" | "deadline" | "recency";

/**
 * Props interface for BidsSection component
 * @property {Project} project - The project object
 * @property {any[]} sortedBids - Array of sorted bids
 * @property {BidSortOption} bidSortOption - Current sort option
 * @property {(option: BidSortOption) => void} setBidSortOption - Function to update sort option
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
interface BidsSectionProps {
  project: Project;
  sortedBids: Bid[];
  bidSortOption: BidSortOption;
  setBidSortOption: (option: BidSortOption) => void;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * BidsSection component displays and manages project bids
 * @param {BidsSectionProps} props - Component props
 * @returns {React.ReactElement} Bids list with sorting controls
 */
export default function BidsSection({
  project,
  sortedBids,
  bidSortOption,
  setBidSortOption,
  setToRefresh,
}: BidsSectionProps) {
  // State for tracking submission status
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  /**
   * Handles seller selection from bids
   * @param {string} bidId - ID of the bid to select
   */
  const handleSelect = async (bidId: string) => {
    try {
      setSubmitting(true);
      await selectSeller(project.id, bidId);
      alert("Seller selected!");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.log(err);
      alert("Failed to select seller.");
    } finally {
      setSubmitting(false);
    }
  };

  // Sort options configuration for the dropdown
  const bidSortOptions = {
    rating: "Ratings (of Seller)",
    budget: "Budget (High → Low)",
    deadline: "Deadline (Soonest First)",
    recency: "Recency (Newest First)",
  };

  // Don't render if no bids, already selected, or cancelled
  if (project.bids.length === 0 || project.selectedBid || project.status === "CANCELLED") {
    return null;
  }

  return (
    // Main section container
    <div className="mt-8">
      {/* Header with title and sort controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 className="text-xl font-bold text-white">Project Bids ({sortedBids.length})</h4>
        <div className="w-full sm:w-64">
          <SortSelector
            selected={bidSortOption}
            onChange={setBidSortOption}
            options={bidSortOptions}
            label="Sort by"
          />
        </div>
      </div>

      {/* Bids grid layout */}
      <div className="grid grid-cols-1 gap-4">
        {sortedBids.map((bid) => (
          // Individual bid card
          <div
            key={bid.id}
            className="p-4 bg-gray-800/60 rounded-xl border border-gray-700/80 shadow-lg transition-all duration-300 ease-in-out hover:border-cyan-500/50 hover:shadow-cyan-500/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Bid details */}
              <div>
                {/* Clickable seller name that navigates to profile */}
                <h5 
                  className="font-semibold text-lg text-gray-100 cursor-pointer break-words" 
                  onClick={() => router.push(`/profile/${bid.sellerId}`)}
                >
                  {bid.sellerName}
                </h5>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-gray-400">
                  <span className="font-semibold text-cyan-400">
                    {currencySymbols[project.budgetCurrency]}{bid.amount.toLocaleString()}
                  </span>
                  <span>{bid.durationDays} days delivery</span>
                </div>
              </div>
              
              {/* Select bid button with loading state */}
              <button
                onClick={() => handleSelect(bid.id)}
                disabled={submitting}
                className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Selecting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Select Bid
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}