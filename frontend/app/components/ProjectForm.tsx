"use client";

import { useEffect, useState } from "react";
import { createProject } from "../services/projectService"; // Original import
import { useUserStore } from "@/store/userStore"; // Original import
import { Currency } from "../types"; // Original import
import { ActiveTab } from "./dashboard/buyer";

// Create a map from currency codes to symbols
export const currencySymbols: { [key in Currency]: string } = {
  USD: "$",
  EUR: "€",
  INR: "₹",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

// Props for ProjectForm component
type ProjectFormProps = {
  toRefresh: boolean; // Flag to trigger refresh in parent component
  setToRefresh: React.Dispatch<React.SetStateAction<boolean>>; // Setter to toggle refresh flag
  tabSwitch: React.Dispatch<React.SetStateAction<ActiveTab>>;
};

/**
 * ProjectForm component
 * Renders a form to create a new project.
 * Handles form state, submission, and basic validation.
 */
export default function ProjectForm({
  toRefresh,
  setToRefresh,
  tabSwitch,
}: ProjectFormProps) {
  const { user } = useUserStore(); // Get current logged-in user info from global store

  // Track if component has mounted (helps with hydration issues in Next.js)
  const [hasMounted, setHasMounted] = useState(false);

  // Track if form submission is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store any error messages for display
  const [error, setError] = useState("");

  // Form state for input fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "20",
    deadline: "",
    buyerId: "", // will be set from logged-in user
    useCustomBudget: false,
    budgetCurrency: "USD" as Currency, // Default to USD
  });

  // On user id change, set buyerId in the form and mark component as mounted
  useEffect(() => {
    setHasMounted(true);
    if (user?.id) {
      setForm((prev) => ({ ...prev, buyerId: user.id }));
    }
  }, [user?.id]);

  /**
   * Handle changes in form inputs (inputs, textarea, and select)
   * Updates corresponding field in form state
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission:
   * - Validate inputs
   * - Call createProject API
   * - Reset form and trigger refresh on success
   * - Show error message on failure
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!form.title || !form.description || !form.budget || !form.deadline) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // The `form` object now includes `budgetCurrency` and will be sent to the API
      await createProject(form);
      // alert("Project created!"); // Removed alert(), use a custom UI or console.log
      console.log("Project created!"); // Logging for this environment

      // Clear form inputs except buyerId and default currency
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        budget: "20",
        deadline: "",
        useCustomBudget: false,
        budgetCurrency: "USD" as Currency, // Reset to default
      }));

      // Trigger refresh in parent component
      setToRefresh(!toRefresh);
      tabSwitch("myProjects")
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Avoid rendering form until component is fully mounted (to prevent hydration issues)
  if (!hasMounted) return null;

  // Render the project creation form
  return (
    <form
      className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700 text-gray-100 font-inter" // Dark mode styles
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-purple-400 mb-6">Create New Project</h2> {/* Dark mode heading */}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-lg text-sm"> {/* Dark mode error */}
          {error}
        </div>
      )}

      {/* Title input */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-1"> {/* Dark mode label */}
          Project Title
        </label>
        <input
          name="title"
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-400" // Dark mode input
          placeholder="e.g. Website redesign"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description textarea */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-1"> {/* Dark mode label */}
          Project Description
        </label>
        <textarea
          name="description"
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[120px] bg-gray-700 text-gray-100 placeholder-gray-400" // Dark mode textarea
          placeholder="Describe your project in detail..."
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

      {/* Budget section */}
      <div className="mb-5 bg-gray-700 p-4 rounded-lg border border-gray-600"> {/* Dark mode budget section */}
        <label className="block text-sm font-medium text-gray-300 mb-3"> {/* Dark mode label */}
          Budget Estimate
        </label>

        {/* Custom budget toggle */}
        <div className="flex items-center mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.useCustomBudget}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  useCustomBudget: !prev.useCustomBudget,
                }))
              }
            />
            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div> {/* Dark mode toggle */}
            <span className="ml-3 text-sm font-medium text-gray-300"> {/* Dark mode text */}
              {form.useCustomBudget ? "Custom Amount" : "Use Slider"}
            </span>
          </label>
        </div>

        {/* Currency and input */}
        <div className="flex gap-4 items-center">
          <select
            name="budgetCurrency"
            value={form.budgetCurrency}
            onChange={handleChange}
            className="border border-gray-600 px-3 py-2 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none" // Dark mode select
          >
            {Object.keys(currencySymbols).map((code) => (
              <option key={code} value={code} className="bg-gray-700 text-gray-100">
                {currencySymbols[code as Currency]} {code}
              </option>
            ))}
          </select>

          <div className="flex-1">
            {form.useCustomBudget ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> {/* Dark mode symbol */}
                  {currencySymbols[form.budgetCurrency]}
                </span>
                <input
                  name="budget"
                  type="number"
                  min="1"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-400" // Dark mode number input
                  placeholder="Enter amount"
                  value={form.budget}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1"> {/* Dark mode slider labels */}
                  <span>{currencySymbols[form.budgetCurrency]}{form.budget}</span>
                  <span>{currencySymbols[form.budgetCurrency]}500</span>
                </div>
                <input
                  name="budget"
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600" // Dark mode range slider
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deadline input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1"> {/* Dark mode label */}
          Project Deadline
        </label>
        <input
          name="deadline"
          type="datetime-local"
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-700 text-gray-100 dark-datetime-input" // Dark mode datetime input
          value={form.deadline}
          onChange={handleChange}
          required

        />
      </div>

      {/* Submit button */}
      <button
        className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${ // Dark mode button
          isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl" // Enhanced hover shadow
        }`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Project...
          </span>
        ) : (
          "Create Project"
        )}
      </button>
    </form>
  );
}