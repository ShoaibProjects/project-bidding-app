// =====================================
// components/RatingSection.tsx
//
// Component for handling seller ratings after project completion.
// Features:
// - Star-based rating input (1-5)
// - Optional text feedback
// - Displays existing rating if already rated
// - Handles submission to backend
// - Dark mode compatible styling
// =====================================

import React, { useState } from 'react';
import { rateSeller } from "../../services/userService";
import { Project } from "../../types";

/**
 * Props interface for RatingSection
 * @property {Project} project - The project being rated
 * @property {number} ratingInputs - Current star rating value (1-5)
 * @property {React.Dispatch<React.SetStateAction<number>>} setRatingInputs - Setter for rating value
 * @property {string} ratingComments - Current rating comment
 * @property {React.Dispatch<React.SetStateAction<string>>} setRatingComments - Setter for comment
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
interface RatingSectionProps {
  project: Project;
  ratingInputs: number;
  setRatingInputs: React.Dispatch<React.SetStateAction<number>>;
  ratingComments: string;
  setRatingComments: React.Dispatch<React.SetStateAction<string>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * RatingSection component handles seller ratings for completed projects.
 * Displays either:
 * - Existing rating (if already rated)
 * - Rating form (if not yet rated)
 * @param {RatingSectionProps} props - Component props
 * @returns {React.ReactElement} Rating display or input form
 */
export default function RatingSection({
  project,
  ratingInputs,
  setRatingInputs,
  ratingComments,
  setRatingComments,
  setToRefresh,
}: RatingSectionProps) {
  // State for tracking submission status
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handles rating submission to backend
   * - Validates rating value
   * - Calls API to submit rating
   * - Triggers refresh on success
   */
  const handleRatingSubmit = async () => {
    if (!ratingInputs || ratingInputs < 1 || ratingInputs > 5) return;

    try {
      setSubmitting(true);
      await rateSeller({
        value: ratingInputs,
        comment: ratingComments,
        projectId: project.id
      });
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error("Rating failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render if project isn't completed
  if (project.status !== "COMPLETED") return null;

  return (
    // Rating container with dark mode styling
    <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
      {/* Section title */}
      <div className="text-sm font-medium text-gray-300 mb-2">Rate Project</div>
      
      {/* Conditional rendering based on whether project already has rating */}
      {project.rating ? (
        // Display existing rating
        <div className="flex items-center gap-2">
          {/* Star rating display */}
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className={star <= (project.rating?.value ?? 0) ? "text-yellow-400" : "text-gray-500"}
              >
                ★
              </span>
            ))}
          </div>
          {/* Rating value and optional comment */}
          <span className="text-xs text-gray-400">
            {project.rating.value}/5
            {project.rating.comment && ` • "${project.rating.comment}"`}
          </span>
        </div>
      ) : (
        // Rating input form
        <div className="space-y-2">
          {/* Star rating selector */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRatingInputs(star)}
                className={`text-lg ${ratingInputs >= star ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}
              >
                ★
              </button>
            ))}
          </div>
          
          {/* Optional comment input */}
          <input
            type="text"
            value={ratingComments}
            onChange={(e) => setRatingComments(e.target.value)}
            placeholder="Quick feedback (optional)"
            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500"
          />
          
          {/* Submit button */}
          <button
            onClick={handleRatingSubmit}
            disabled={submitting || !ratingInputs}
            className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded"
          >
            {submitting ? "..." : "Rate"}
          </button>
        </div>
      )}
    </div>
  );
}