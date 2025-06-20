// =====================================
// components/SelectedBidSection.tsx
// =====================================
import { useRouter } from "next/navigation";
import { unselectSeller } from "../../services/projectService";
import { Project } from "../../types";
import { User, MessageSquare, Trash2, Loader2 } from "lucide-react";

interface SelectedBidSectionProps {
  project: Project;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SelectedBidSection({
  project,
  submitting,
  setSubmitting,
  setToRefresh,
}: SelectedBidSectionProps) {
  const router = useRouter();

  const removeSelectedSeller = async () => {
    // NOTE: For a more modern UX, consider replacing confirm/alert 
    // with custom modal/toast components in the future.
    const confirmed = confirm(
      "Are you sure you want to remove the selected seller? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await unselectSeller(project.id);
      alert("Seller removed from the project.");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert("Failed to remove the seller.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!project.selectedBid) return null;

  return (
    // Main component card with modern dark-mode styling
    <div className="mt-6 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80 shadow-lg">
      
      {/* Header with modern badge */}
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-semibold text-white">Selected Bid</h4>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-400/30">
          Active
        </span>
      </div>

      <div className="space-y-4">
        {/* Seller info section with dark-mode friendly avatar and text */}
        <div className="flex items-center">
          <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium border border-gray-600">
            {project.selectedBid.sellerName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <p className="text-base font-medium text-gray-100">{project.selectedBid.sellerName}</p>
            <p className="text-sm text-gray-400">
              ${project.selectedBid.amount.toLocaleString()} • {project.selectedBid.durationDays} days
            </p>
          </div>
        </div>

        {/* Action buttons with updated dark-mode styling */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => router.push(`/profile/${project.selectedBid?.sellerId}`)}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-cyan-500"
            title="View Profile"
          >
            <User className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => router.push(`/chats?sellerId=${project.selectedBid?.sellerId}`)}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-cyan-500"
            title="Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {(project.status === "IN_PROGRESS" || 
            project.status === "IN_REVIEW" || 
            project.status === "CHANGES_REQUESTED") && (
            <button
              onClick={removeSelectedSeller}
              disabled={submitting}
              className="ml-auto p-2.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-red-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:text-red-500/50"
              title="Remove Seller"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}