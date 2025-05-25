"use client";

import { useEffect, useState } from "react";
import { createProject } from "../services/projectService";
import { useUserStore } from "@/store/userStore";

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

  // Form state for input fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "20",
    deadline: "",
    buyerId: "", // will be set from logged-in user
    useCustomBudget: false,
  });

  // On user id change, set buyerId in the form and mark component as mounted
  useEffect(() => {
    setHasMounted(true);
    if (user?.id) {
      setForm((prev) => ({ ...prev, buyerId: user.id }));
    }
  }, [user?.id]);

  /**
   * Handle changes in form inputs (both text inputs and textarea)
   * Updates corresponding field in form state
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await createProject(form);
      alert("Project created!");

      // Clear form inputs except buyerId
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        budget: "",
        deadline: "",
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

      {/* Budget section with slider + custom input option for Budget input*/}
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

        {form.useCustomBudget ? (
          <input
            name="budget"
            type="number"
            min="1"
            className="w-full border p-2 rounded"
            placeholder="Enter custom budget"
            value={form.budget}
            onChange={handleChange}
          />
        ) : (
          <div>
            <p className="text-sm mb-1">Selected: ${form.budget}</p>
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
