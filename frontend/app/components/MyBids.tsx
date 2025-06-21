"use client";

// Import necessary hooks and components from React and other libraries.
import { useEffect, useState } from "react";
import { getBidsBySeller } from "../services/bidService"; // Service function to fetch bids.
import { Bid } from "../types"; // Type definitions for the application.
import { useUserStore } from "@/store/userStore"; // Global state management for user data.
import { motion, AnimatePresence } from "framer-motion"; // For animations.
import {
  Loader2,
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  Inbox,
  User,
  Eye,
  RefreshCcw,
  AlertTriangle,
  FileClock,
} from "lucide-react"; // Icon library.
import { currencySymbols } from "./ProjectForm"; // Shared currency symbols map.

/**
 * @component StatusBadge
 * @description A helper component to render a styled badge for different project statuses.
 * @param {{ status: string }} props - The props for the component.
 * @param {string} props.status - The project status string (e.g., "IN_PROGRESS").
 * @returns {React.ReactElement} A styled div element representing the status badge.
 */
const StatusBadge = ({ status }: { status: string }) => {
  // A record mapping each status to its corresponding icon, label, and Tailwind CSS classes.
  const statusStyles: Record<
    string,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    IN_PROGRESS: {
      icon: <RefreshCcw className="w-3 h-3" />,
      label: "In Progress",
      className: "bg-blue-900/50 text-blue-300 border-blue-500/30",
    },
    COMPLETED: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Completed",
      className: "bg-green-900/50 text-green-300 border-green-500/30",
    },
    IN_REVIEW: {
      icon: <Eye className="w-3 h-3" />,
      label: "In Review",
      className: "bg-purple-900/50 text-purple-300 border-purple-500/30",
    },
    CHANGES_REQUESTED: {
      icon: <AlertTriangle className="w-3 h-3" />,
      label: "Changes Requested",
      className: "bg-yellow-900/50 text-yellow-300 border-yellow-500/30",
    },
    PENDING: {
      icon: <FileClock className="w-3 h-3" />,
      label: "Pending",
      className: "bg-gray-700 text-gray-400 border-gray-600",
    },
  };

  // Select the appropriate style object based on the status prop, or default to "PENDING" if not found.
  const style = statusStyles[status] || statusStyles["PENDING"];

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style.className}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </div>
  );
};

/**
 * @component MyBidsList
 * @description Displays a list of all bids placed by the currently logged-in seller.
 * It fetches the seller's bids and renders them in an interactive, card-based UI.
 * The component handles its own loading and empty states.
 * @param {{ toRefresh: boolean }} props - Component props.
 * @param {boolean} props.toRefresh - A flag that, when its value changes, triggers a re-fetch of the bid data.
 * @returns {React.ReactElement} The rendered list of bids or a state indicator (loading/empty).
 */
export default function MyBidsList({ toRefresh }: { toRefresh: boolean }) {
  // State from global store: Retrieves the current user's data.
  const { user } = useUserStore();
  // Local component state: `bids` stores the array of fetched bid objects.
  const [bids, setBids] = useState<Bid[]>([]);
  // Local component state: `loading` tracks the data fetching status.
  const [loading, setLoading] = useState(true);

  /**
   * @function fetchBids
   * @description Asynchronously fetches bids for a specific seller and updates the component's state.
   * @param {string} sellerId - The unique identifier of the seller.
   */
  const fetchBids = async (sellerId: string) => {
    try {
      setLoading(true); // Set loading to true before starting the fetch.
      const res = await getBidsBySeller(sellerId);
      setBids(res.data); // Update the bids state with the fetched data.
    } catch (error) {
      // Log any errors that occur during the fetch operation.
      console.error("Failed to fetch bids:", error);
    } finally {
      // Ensure loading is set to false after the fetch completes (either success or failure).
      setLoading(false);
    }
  };
  
  // React Effect Hook: This runs when the component mounts and whenever `user.id` or `toRefresh` changes.
  useEffect(() => {
    // Only fetch bids if a valid user ID is available.
    if (user?.id) {
      fetchBids(user.id);
    }
  }, [user?.id, toRefresh]); // Dependencies array for the effect.

  // --- Conditional Rendering: Loading State ---
  // If data is currently being fetched, display a loading spinner.
  if (loading) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-400 py-20"
        >
          <Loader2 className="animate-spin w-6 h-6 text-sky-500" />
          <span className="text-lg">Loading your bids...</span>
        </motion.div>
      </div>
    );
  }

  // --- Conditional Rendering: Empty State ---
  // If fetching is complete and there are no bids, display a user-friendly message.
  if (bids.length === 0) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 w-full max-w-md"
        >
          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">No Bids Yet</h3>
          <p className="text-gray-400 mt-1">
            You haven't placed any bids on projects. Start exploring to find
            opportunities!
          </p>
        </motion.div>
      </div>
    );
  }

  // --- Main Render Logic ---
  // Render the list of bid cards if bids exist.
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-sky-400" />
              Your Bids
            </h1>
            <p className="text-gray-400 mt-1">
              Overview of all bids you have placed on projects.
            </p>
          </div>
        </header>

        {/* Grid container for the bid cards */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {bids.map((bid) => (
              // Each bid card is a motion.div for entry/exit animations.
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10 flex flex-col"
              >
                {/* --- Project Details Section --- */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {bid.project?.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                        {bid.project?.description}
                      </p>
                    </div>
                    {/* Conditionally render the status badge if project status is available */}
                    {bid.project?.status && (
                      <StatusBadge status={bid.project.status} />
                    )}
                  </div>
                  {/* Project metadata */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />{" "}
                      <span className="font-medium text-gray-300">
                        {bid.project?.buyer?.email || "N/A"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />{" "}
                      <span className="font-medium text-gray-300">
                        <strong>Budget:</strong> {currencySymbols[(bid.project?.budgetCurrency) || "USD"]}{bid.project?.budget}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />{" "}
                      <span className="font-medium text-gray-300">
                        <strong>Deadline:</strong>{" "}
                        {bid.project?.deadline
                          ? new Date(bid.project.deadline).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* --- "Got Selected" Indicator --- */}
                {/* This block renders only if the current bid is the one selected for the project. */}
                {bid.project?.selectedBidId === bid.id && (
                  <div className="px-6 py-4 bg-emerald-900/40 border-t border-emerald-700/50 text-emerald-400 font-semibold flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Your bid was selected for this project!</span>
                  </div>
                )}

                {/* --- Your Bid Details Section --- */}
                <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50 rounded-b-xl">
                  <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-sky-400" />
                    Your Bid Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>
                        <strong>Amount:</strong> {currencySymbols[(bid.project?.budgetCurrency) || "USD"]}{bid.amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>
                        <strong>Duration:</strong> {bid.durationDays} days
                      </span>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MessageSquare className="w-4 h-4 mt-1 text-blue-500" />
                      <span>
                        <strong>Message:</strong> {bid.message}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}