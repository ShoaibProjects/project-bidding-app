"use client";

import { useEffect, useState } from "react";
import { getBidsBySeller } from "../services/bidService";
import { Bid } from "../types";
import { useUserStore } from "@/store/userStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  AlertCircle,
  Inbox, // Added Inbox for empty state
  User, // Added User icon for buyer
  Eye, // Added Eye icon for In Review status
  RefreshCcw, // Added for In Progress
  FileCheck2, // Added for Completed
  AlertTriangle, // Added for Changes Requested
  FileClock, // Added for Pending
} from "lucide-react";
import { currencySymbols } from "./ProjectForm";

// Helper component to render status badges with appropriate colors and icons
// Copied directly from your AssignedProjectList for consistency
const StatusBadge = ({ status }: { status: string }) => {
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
 * MyBidsList Component
 *
 * Displays a list of bids placed by the logged-in seller on various projects.
 * Shows bid details along with related project info in a modern dark mode UI.
 *
 * Props:
 * - toRefresh: boolean flag to trigger re-fetching of bids when updated externally.
 */
export default function MyBidsList({ toRefresh }: { toRefresh: boolean }) {
  // Get currently logged-in user from global state/store
  const { user } = useUserStore();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  // Effect: fetch bids when user ID or refresh flag changes
  useEffect(() => {
    if (user?.id) {
      fetchBids(user.id);
    }
  }, [user?.id, toRefresh]);

  const fetchBids = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await getBidsBySeller(sellerId);
      setBids(res.data);
    } catch (error) {
      console.error("Failed to fetch bids:", error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state UI
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

  // Empty state UI when no bids found
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

  // Render list of bids with project info and bid details
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {bids.map((bid) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10 flex flex-col"
              >
                {/* Project Details Section */}
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
                    {bid.project?.status && (
                      <StatusBadge status={bid.project.status} />
                    )}
                  </div>
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

                {/* "Got Selected" Indicator */}
                {bid.project?.selectedBidId === bid.id && (
                  <div className="px-6 py-4 bg-emerald-900/40 border-t border-emerald-700/50 text-emerald-400 font-semibold flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Your bid was selected for this project!</span>
                  </div>
                )}

                {/* Your Bid Details Section */}
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