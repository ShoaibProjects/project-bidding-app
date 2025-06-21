"use client";

import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import { placeBid } from "../services/bidService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Gavel,
  User,
} from "lucide-react";
import { getSortableList } from "../utils/getSortableList";
import { AnimatePresence, motion } from "framer-motion";
import { currencySymbols } from "./ProjectForm";

/**
 * @typedef {'budget' | 'deadline' | 'recency'} SortOption
 * @description The available options for sorting projects.
 */
type SortOption = "budget" | "deadline" | "recency";

/**
 * @typedef {object} BidInput
 * @property {number} amount - The amount of the bid.
 * @property {number} durationDays - The estimated duration of the project in days.
 * @property {string} message - A message from the seller to the buyer.
 */
type BidInput = {
  amount: number;
  durationDays: number;
  message: string;
};

/**
 * A more visually appealing Sort Selector component.
 * @param {object} props - The component props.
 * @param {SortOption} props.selected - The currently selected sort option.
 * @param {(value: SortOption) => void} props.onChange - The callback function to be called when the sort option changes.
 * @returns {JSX.Element} The rendered SortSelector component.
 */
const SortSelector = ({
  selected,
  onChange,
}: {
  selected: SortOption;
  onChange: (value: SortOption) => void;
}) => {
  const sortOptions: Record<SortOption, string> = {
    budget: "Budget (High → Low)",
    deadline: "Deadline (Soonest First)",
    recency: "Recency (Newest First)",
  };

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none cursor-pointer bg-slate-800/50 border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors hover:bg-slate-700/60"
      >
        {Object.entries(sortOptions).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};

/**
 * The main component for displaying the list of projects.
 * @param {object} props - The component props.
 * @param {boolean} props.toRefresh - A boolean to trigger a refresh of the project list.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} [props.setToRefresh] - The function to update the refresh state.
 * @returns {JSX.Element} The rendered ProjectList component.
 */
export default function ProjectList({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("recency");
  const [bidInputs, setBidInputs] = useState<Record<string, BidInput>>({});
  const { user } = useUserStore();
  // Using a map to manage the open/closed state for each project's forms individually
  const [openSections, setOpenSections] = useState<Record<string, 'bid' | 'existing' | null>>({});


  useEffect(() => {
    fetchProjects();
  }, [toRefresh]);

  /**
   * Fetches the list of projects from the server.
   */
  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  /**
   * Toggles the collapsible sections (bid form, existing bids) for a specific project.
   */
  const toggleSection = (projectId: string, section: 'bid' | 'existing') => {
    setOpenSections(prev => ({
      ...prev,
      [projectId]: prev[projectId] === section ? null : section
    }));
  };

  /**
   * Handles the placement of a bid on a project.
   * @param {string} projectId - The ID of the project to place a bid on.
   */
  const handleBid = async (projectId: string) => {
    const bid = bidInputs[projectId];
    if (
      !bid?.amount ||
      bid.amount <= 0 ||
      !bid?.durationDays ||
      bid.durationDays <= 0 ||
      !bid?.message ||
      bid.message.trim() === ""
    ) {
      return alert("❗ Please enter a valid amount, duration, and message.");
    }
    try {
      await placeBid({
        ...bid,
        projectId,
        sellerId: user?.id || "",
        sellerName: user?.email || "",
      });
      setToRefresh?.(!toRefresh);
      alert("✅ Bid placed!");
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place bid");
    }
  };

  const sortedProjects = getSortableList(projects, sortOption, "project");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      {/* Responsive container with padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* --- Header Section --- */}
        {/* RESPONSIVE CHANGE: Flex direction stacks on mobile (flex-col) and goes to row on medium screens (md:flex-row) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
          {/* RESPONSIVE CHANGE: Text size is smaller on mobile (text-3xl) and larger on sm screens up */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 flex items-center gap-4">
            <Briefcase className="text-teal-400 w-8 h-8" />
            Open Projects
          </h1>
          {/* RESPONSIVE CHANGE: Aligns the sort selector to the start on mobile */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-sm font-medium text-slate-400">Sort by:</span>
            <SortSelector selected={sortOption} onChange={setSortOption} />
          </div>
        </div>

        {/* --- Project Cards Grid --- */}
        {/* RESPONSIVE CHANGE: Added `md:grid-cols-2` for a better tablet layout. */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-teal-400/50 hover:shadow-2xl hover:shadow-teal-900/50 flex flex-col"
            >
              <div className="p-6 flex-grow">
                {/* RESPONSIVE CHANGE: Stacks on small screens (<640px) and becomes a row on `sm` screens and up. `items-start` ensures alignment is clean. */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-100 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  {/* Budget Badge */}
                  <div className="flex-shrink-0 bg-teal-400/10 text-teal-300 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ring-teal-400/20 flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4" />
                    <span>
                      {currencySymbols[project.budgetCurrency]}
                      {project.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center text-slate-400">
                    <User className="w-4 h-4 mr-2 text-teal-500" />
                    <span className="font-medium text-slate-300">
                      {project.buyer?.email}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-400">
                    <CalendarDays className="w-4 h-4 mr-2 text-teal-500" />
                    <span className="font-medium text-slate-300">
                      {new Date(project.deadline).toLocaleString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "numeric", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-6 pt-0">
                {/* --- Place Bid Form --- */}
                {!project.bids.some((bid) => bid.sellerName === user?.email) &&
                  user?.role === "SELLER" && (
                    <div className="mt-6 bg-gray-900/50 rounded-xl shadow-lg border border-gray-700">
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer"
                        onClick={() => toggleSection(project.id, 'bid')}
                      >
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Gavel className="w-5 h-5 text-sky-400" />
                          Place Your Bid
                        </h4>
                        <motion.div
                          animate={{ rotate: openSections[project.id] === 'bid' ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {openSections[project.id] === 'bid' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-gray-700">
                              {/* RESPONSIVE CHANGE: Stacks to 1 col on mobile, 2 on md screens */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount ({currencySymbols[project.budgetCurrency]})</label>
                                  <input
                                    type="number"
                                    placeholder="2500"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                    onChange={(e) =>
                                      setBidInputs((prev) => ({
                                        ...prev,
                                        [project.id]: {
                                          ...prev[project.id],
                                          amount: Number(e.target.value),
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration (days)</label>
                                  <input
                                    type="number"
                                    placeholder="14"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                    onChange={(e) =>
                                      setBidInputs((prev) => ({
                                        ...prev,
                                        [project.id]: {
                                          ...prev[project.id],
                                          durationDays: Number(e.target.value),
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Proposal Message</label>
                                <input
                                  placeholder="I can deliver high-quality work..."
                                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                  onChange={(e) =>
                                    setBidInputs((prev) => ({
                                      ...prev,
                                      [project.id]: {
                                        ...prev[project.id],
                                        message: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                              <button
                                className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500"
                                onClick={() => handleBid(project.id)}
                              >
                                <Gavel className="w-4 h-4" />
                                Submit Bid
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                {/* --- Existing Bids List --- */}
                {project.bids.length > 0 && (
                  <div className="mt-4 bg-gray-900/50 rounded-xl shadow-lg border border-gray-700">
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer"
                      onClick={() => toggleSection(project.id, 'existing')}
                    >
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <BadgeCheck className="text-emerald-400 w-5 h-5" />
                        Existing Bids ({project.bids.length})
                      </h4>
                      <motion.div
                        animate={{ rotate: openSections[project.id] === 'existing' ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {openSections[project.id] === 'existing' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-gray-700">
                            <div className="space-y-3">
                              {project.bids.map((bid) => (
                                <div
                                  key={bid.id}
                                  className="bg-gray-800/60 rounded-lg p-4 border border-gray-700"
                                >
                                  {/* RESPONSIVE CHANGE: Stacks on mobile, row on `sm` screens up */}
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                    <div className="mb-2 sm:mb-0">
                                      <div className="font-semibold text-white break-words">{bid.sellerName}</div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        <span className="font-bold text-emerald-400">
                                          {currencySymbols[project.budgetCurrency]}
                                          {bid.amount.toLocaleString()}
                                        </span>{" "}
                                        in {bid.durationDays} days
                                      </div>
                                    </div>
                                    {/* TODO: Add a "Select Bid" button here if the current user is the project buyer */}
                                  </div>
                                  {bid.message && (
                                    <div className="mt-2 text-sm text-gray-400 italic pl-3 border-l-2 border-gray-600">
                                      "{bid.message}"
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}