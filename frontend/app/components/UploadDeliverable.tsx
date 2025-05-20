import { useState } from "react";
import { uploadDeliverable } from "../services/projectService";

interface UploadDeliverableProps {
  projectId: string;
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * UploadDeliverable component
 * ---------------------------
 * Allows users (e.g., sellers) to upload deliverable files for a given project.
 * Handles file selection, validation, upload progress, and error handling.
 *
 * Props:
 * - projectId: ID of the project for which the deliverable is uploaded.
 * - toRefresh: boolean flag to trigger parent refresh.
 * - setToRefresh: optional setter function to toggle refresh flag in parent component.
 */
const UploadDeliverable = ({ projectId, toRefresh, setToRefresh }: UploadDeliverableProps) => {
  // State to store the selected file from the input
  const [file, setFile] = useState<File | null>(null);
  // Flag to indicate if upload is in progress
  const [isUploading, setIsUploading] = useState(false);
  // String to hold any validation or upload errors
  const [error, setError] = useState("");

  // Handler when user selects a file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(""); // Clear previous errors when new file is selected
    }
  };

  // Handler for submit button click to upload the deliverable
  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a file before submitting.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Call service to upload deliverable with project ID and file
      await uploadDeliverable(projectId, file);
      alert("Deliverable uploaded successfully! Buyer has been notified.");
      setFile(null); // Clear selected file after successful upload
      setToRefresh?.(!toRefresh); // Trigger parent refresh if setter provided
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload deliverable. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <h3 className="text-lg font-semibold">Upload Deliverable</h3>

      {/* File input with accepted file types */}
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 rounded w-full"
        accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.png,.mp4"
      />

      {/* Show error message if any */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Submit button disabled and styled during upload */}
      <button
        onClick={handleSubmit}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium duration-100 transform hover:scale-[1.02] transition ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Submit Deliverable"}
      </button>

      {/* Display selected file name if any */}
      {file && (
        <p className="text-sm text-gray-600">
          Selected: <strong>{file.name}</strong>
        </p>
      )}
    </div>
  );
};

export default UploadDeliverable;
