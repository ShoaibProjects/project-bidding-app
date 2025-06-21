"use client";

import { useEffect, useState } from "react";
import { createProject } from "../services/projectService";
import { useUserStore } from "@/store/userStore";
import { Currency } from "../types";
import { ActiveTab } from "./dashboard/buyer";

/**
 * A mapping of currency codes to their corresponding symbols.
 * This provides a centralized and easily extensible way to handle currency display.
 * @type {Record<Currency, string>}
 */
export const currencySymbols: { [key in Currency]: string } = {
  USD: "$",
  EUR: "€",
  INR: "₹",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

/**
 * @typedef {object} ProjectFormProps
 * @property {boolean} toRefresh - A flag passed from the parent component. When its value changes, it indicates that parent data should be refreshed.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setToRefresh - The state setter function from the parent to toggle the `toRefresh` flag.
 * @property {React.Dispatch<React.SetStateAction<ActiveTab>>} tabSwitch - A state setter function to programmatically switch tabs in the parent component upon successful project creation.
 */
type ProjectFormProps = {
  toRefresh: boolean;
  setToRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  tabSwitch: React.Dispatch<React.SetStateAction<ActiveTab>>;
};

/**
 * A form component for buyers to create new projects.
 * It handles all aspects of the form, including input state, validation,
 * submission logic, loading indicators, and error handling.
 * On successful submission, it communicates with its parent component to refresh data and switch views.
 *
 * @param {ProjectFormProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered form component or null if not yet mounted.
 */
export default function ProjectForm({
  toRefresh,
  setToRefresh,
  tabSwitch,
}: ProjectFormProps) {
  // Global state hook to get the currently authenticated user.
  const { user } = useUserStore();

  // State to ensure the component only renders on the client-side, preventing SSR/hydration mismatches.
  const [hasMounted, setHasMounted] = useState(false);

  // State to track the form's submission status, used to disable the submit button and show a loader.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to hold and display any validation or API error messages to the user.
  const [error, setError] = useState("");

  // State object to manage all form input fields in a single place.
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "20",
    deadline: "",
    buyerId: "", // Automatically set from the logged-in user's ID.
    useCustomBudget: false, // Toggles between a slider and a number input for the budget.
    budgetCurrency: "USD" as Currency, // Default currency.
  });

  // This effect runs once after the component mounts and whenever the user's ID changes.
  // It sets the `hasMounted` flag to true and populates the `buyerId` in the form.
  useEffect(() => {
    setHasMounted(true);
    if (user?.id) {
      setForm((prev) => ({ ...prev, buyerId: user.id }));
    }
  }, [user?.id]);

  /**
   * A generic change handler for all form inputs.
   * It updates the corresponding field in the `form` state based on the input's `name` attribute.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The event object from the input field.
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
   * Handles the form submission process.
   * It performs client-side validation, calls the `createProject` API service,
   * manages loading and error states, and resets the form on success.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default browser form submission.

    // Basic client-side validation to ensure all required fields are filled.
    if (!form.title || !form.description || !form.budget || !form.deadline) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(""); // Clear any previous errors.
    setIsSubmitting(true); // Set loading state.

    try {
      // Call the API service to create the project with the form data.
      await createProject(form);
      console.log("Project created successfully!");

      // Reset the form to its initial state, preserving the buyerId.
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        budget: "20",
        deadline: "",
        useCustomBudget: false,
        budgetCurrency: "USD" as Currency,
      }));

      // Trigger a data refresh in the parent component.
      setToRefresh(!toRefresh);
      // Switch the parent component's view to the "My Projects" tab.
      tabSwitch("myProjects");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create the project. Please try again later.");
    } finally {
      setIsSubmitting(false); // Reset loading state regardless of outcome.
    }
  };

  // Prevents server-side rendering of the form to avoid hydration errors with client-side state.
  if (!hasMounted) return null;

  // Render the project creation form with dark-mode styling.
  return (
    <form
      className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700 text-gray-100 font-inter"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-2xl font-bold text-purple-400 mb-6">
        Create New Project
      </h2>

      {/* Display error messages in a styled box if any exist. */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Project Title Input */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Project Title
        </label>
        <input
          name="title"
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-400"
          placeholder="e.g. Full-Stack E-commerce Platform"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Project Description Textarea */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Project Description
        </label>
        <textarea
          name="description"
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[120px] bg-gray-700 text-gray-100 placeholder-gray-400"
          placeholder="Describe the project requirements, deliverables, and goals in detail..."
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

      {/* Budget Section */}
      <div className="mb-5 bg-gray-700 p-4 rounded-lg border border-gray-600">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Budget Estimate
        </label>

        {/* Toggle between slider and custom budget input */}
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
            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {form.useCustomBudget ? "Enter Custom Amount" : "Use Budget Slider"}
            </span>
          </label>
        </div>

        {/* Currency Selector and Budget Input */}
        <div className="flex gap-4 items-center">
          <select
            name="budgetCurrency"
            value={form.budgetCurrency}
            onChange={handleChange}
            className="border border-gray-600 px-3 py-2 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none"
          >
            {Object.keys(currencySymbols).map((code) => (
              <option
                key={code}
                value={code}
                className="bg-gray-700 text-gray-100"
              >
                {currencySymbols[code as Currency]} {code}
              </option>
            ))}
          </select>

          <div className="flex-1">
            {form.useCustomBudget ? (
              // Custom Budget Number Input
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {currencySymbols[form.budgetCurrency]}
                </span>
                <input
                  name="budget"
                  type="number"
                  min="1"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-400"
                  placeholder="Enter amount"
                  value={form.budget}
                  onChange={handleChange}
                />
              </div>
            ) : (
              // Budget Range Slider
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
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
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Deadline Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Project Deadline
        </label>
        <input
          name="deadline"
          type="datetime-local"
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-700 text-gray-100 dark-datetime-input"
          value={form.deadline}
          onChange={handleChange}
          required
        />
      </div>

      {/* Submit Button with Loading State */}
      <button
        className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
        }`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
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
