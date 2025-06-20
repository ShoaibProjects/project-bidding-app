// =====================================
// components/RatingSection.tsx
// =====================================
import React from 'react';
import { rateSeller } from "../../services/userService";
import { Project } from "../../types";

interface RatingSectionProps {
  project: Project;
  ratingInputs: number;
  setRatingInputs: React.Dispatch<React.SetStateAction<number>>;
  ratingComments: string;
  setRatingComments: React.Dispatch<React.SetStateAction<string>>;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RatingSection({
  project,
  ratingInputs,
  setRatingInputs,
  ratingComments,
  setRatingComments,
  submitting,
  setSubmitting,
  setToRefresh,
}: RatingSectionProps) {
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

  if (project.status !== "COMPLETED") return null;

  return (
    <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
      <div className="text-sm font-medium text-gray-300 mb-2">Rate Project</div>
      
      {project.rating ? (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= (project.rating?.value ?? 0) ? "text-yellow-400" : "text-gray-500"}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {project.rating.value}/5
            {project.rating.comment && ` • "${project.rating.comment}"`}
          </span>
        </div>
      ) : (
        <div className="space-y-2">
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
          
          <input
            type="text"
            value={ratingComments}
            onChange={(e) => setRatingComments(e.target.value)}
            placeholder="Quick feedback (optional)"
            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500"
          />
          
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