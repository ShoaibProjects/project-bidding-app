// =====================================
// components/BidsSection.tsx
// =====================================
import { selectSeller } from "../../services/projectService";
import { Project } from "../../types";
import { currencySymbols } from "../ProjectForm";
import SortSelector from "./SortSelector"; // Assuming this is a custom component
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type BidSortOption = "rating" | "budget" | "deadline" | "recency";

interface BidsSectionProps {
  project: Project;
  sortedBids: any[];
  bidSortOption: BidSortOption;
  setBidSortOption: (option: BidSortOption) => void;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BidsSection({
  project,
  sortedBids,
  bidSortOption,
  setBidSortOption,
  submitting,
  setSubmitting,
  setToRefresh,
}: BidsSectionProps) {
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

  const bidSortOptions = {
    rating: "Ratings (of Seller)",
    budget: "Budget (High → Low)",
    deadline: "Deadline (Soonest First)",
    recency: "Recency (Newest First)",
  };

  if (project.bids.length === 0 || project.selectedBid || project.status === "CANCELLED") {
    return null;
  }
  const router = useRouter();

  return (
    // Main section container with modern dark styling
    <div className="mt-8">
      {/* Header with improved layout and dark-mode text */}
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

      {/* Grid layout for bids for better responsiveness */}
      <div className="grid grid-cols-1 gap-4">
        {sortedBids.map((bid) => (
          // Individual bid card with enhanced dark-mode styling and hover effect
          <div
            key={bid.id}
            className="p-4 bg-gray-800/60 rounded-xl border border-gray-700/80 shadow-lg transition-all duration-300 ease-in-out hover:border-cyan-500/50 hover:shadow-cyan-500/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h5 className="font-semibold text-lg text-gray-100 cursor-pointer" onClick={()=>{router.push(`/profile/${bid.sellerId}`)}}>{bid.sellerName}</h5>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-gray-400">
                  <span className="font-semibold text-cyan-400">{currencySymbols[project.budgetCurrency]}{bid.amount.toLocaleString()}</span>
                  <span>{bid.durationDays} days delivery</span>
                </div>
              </div>
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