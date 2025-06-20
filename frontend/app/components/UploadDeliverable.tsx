"use client";

import { useState } from "react";
import { uploadDeliverable } from "../services/projectService";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setSuccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a file before submitting.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess(false);

    try {
      await uploadDeliverable(projectId, file);
      setSuccess(true);
      setFile(null);
      setToRefresh?.(!toRefresh);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload deliverable. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700 space-y-3"> {/* Reduced padding, rounded, shadow */}
      <div className="flex items-center gap-2"> {/* Reduced gap */}
        <Upload className="w-5 h-5 text-sky-400" /> {/* Smaller icon */}
        <h3 className="text-lg font-semibold text-white">Upload Deliverable</h3> {/* Smaller title text */}
      </div>

      <div className="space-y-1.5"> {/* Reduced space between elements */}
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300"> {/* Reduced gap, kept text-sm */}
          <File className="w-4 h-4 text-sky-400" /> {/* Kept icon size */}
          Select File (JPG, PNG, MP4)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="border border-gray-700 rounded-md px-3 py-1.5 w-full text-gray-300 bg-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer transition-colors" // Smaller padding, rounded-md, adjusted file button
          accept=".jpg,.png,.mp4"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-red-300 bg-red-900/50 p-2 rounded-md border border-red-500/30" // Smaller padding, text-xs, rounded-md
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {/* Smaller icon */}
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-green-300 bg-green-900/50 p-2 rounded-md border border-green-500/30" // Smaller padding, text-xs, rounded-md
        >
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> {/* Smaller icon */}
          Deliverable uploaded successfully! Buyer has been notified.
        </motion.div>
      )}

      {file && (
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <File className="w-4 h-4 text-gray-500" />
          <strong>{file.name}</strong>
        </p>
      )}

      <motion.button
        onClick={handleSubmit}
        whileHover={!isUploading ? { scale: 1.02 } : {}}
        whileTap={!isUploading ? { scale: 0.98 } : {}}
        disabled={isUploading}
        className={`w-full flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md font-medium transition-colors ${ // Smaller padding, rounded-md
          isUploading ? "opacity-70 cursor-not-allowed" : "hover:bg-sky-500"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Submit Deliverable
          </>
        )}
      </motion.button>
    </div>
  );
};

export default UploadDeliverable;