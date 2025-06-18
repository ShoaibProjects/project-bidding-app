"use client";

import { useEffect, useState } from "react";
import { createProject } from "../services/projectService";
import { useUserStore } from "@/store/userStore";
import { Currency } from "../types"; // ✅ 1. Import the Currency type


// ✅ 1. Create a map from currency codes to symbols
const currencySymbols: { [key in Currency]: string } = {
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
};

/**
 * ProjectForm component
 * Renders a form to create a new project.
 * Handles form state, submission, and basic validation.
 */
export default function ProjectForm({
  toRefresh,
  setToRefresh,
}: ProjectFormProps) {
  const { user } = useUserStore(); // Get current logged-in user info from global store

  // Track if component has mounted (helps with hydration issues in Next.js)
  const [hasMounted, setHasMounted] = useState(false);

  // Track if form submission is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store any error messages for display
  const [error, setError] = useState("");

  // ✅ 2. Update form state to include budgetCurrency
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
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement // ✅ Add HTMLSelectElement
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
      alert("Project created!");

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
      className="space-y-4 p-4 bg-white shadow-md rounded"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold">Create Project</h2>

      {/* Show error message if any */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Title input */}
      <input
        name="title"
        className="w-full border p-2 rounded"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />

      {/* Description textarea */}
      <textarea
        name="description"
        className="w-full border p-2 rounded max-h-30 min-h-12"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />

      {/* Budget section with slider + custom input option for Budget input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Budget
        </label>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="customBudgetToggle"
            checked={form.useCustomBudget}
            onChange={() =>
              setForm((prev) => ({
                ...prev,
                useCustomBudget: !prev.useCustomBudget,
              }))
            }
          />
          <label htmlFor="customBudgetToggle" className="text-sm">
            Enter custom est. budget
          </label>
        </div>

        {/* ✅ 3. Add currency dropdown and integrate it with the budget inputs */}
        <div className="flex items-center gap-4">
          <select
            name="budgetCurrency"
            value={form.budgetCurrency}
            onChange={handleChange}
            className="border p-2 rounded bg-gray-100"
          >
            <option value="USD">$ (USD)</option>
            <option value="EUR">€ (EUR)</option>
            <option value="INR">₹ (INR)</option>
            <option value="GBP">£ (GBP)</option>
            <option value="CAD">C$ (CAD)</option>
          </select>

          <div className="w-full">
            {form.useCustomBudget ? (
                            <div className="relative w-full">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    {currencySymbols[form.budgetCurrency]}
                  </span>
              <input
                name="budget"
                type="number"
                min="1"
                className="w-full border p-2 rounded"
                placeholder="Enter custom budget"
                value={form.budget}
                onChange={handleChange}
              />
                </div>
            ) : (
              <div className="w-full">
                <p className="text-sm mb-1">
                  Selected: {currencySymbols[form.budgetCurrency]} {form.budget}
                </p>
                <input
                  name="budget"
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deadline input */}
      <input
        name="deadline"
        type="datetime-local"
        className="w-full border p-2 rounded"
        value={form.deadline}
        onChange={handleChange}
        required
      />

      {/* Submit button */}
      <button
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium duration-100 transform hover:scale-[1.02] ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create"}
      </button>
    </form>
  );
}