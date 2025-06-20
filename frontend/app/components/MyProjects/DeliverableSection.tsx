// =====================================
// components/DeliverableSection.tsx
// =====================================
import { ExternalLink, Check, RefreshCw, Loader2 } from "lucide-react";
import { completeProject, requestChanges } from "../../services/projectService";
import { Project } from "../../types";

interface DeliverableSectionProps {
  project: Project;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeliverableSection({
  project,
  submitting,
  setSubmitting,
  setToRefresh,
}: DeliverableSectionProps) {
  const handleComplete = async () => {
    try {
      setSubmitting(true);
      await completeProject(project.id);
      alert("Project marked as completed!");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.log(err);
      alert("Failed to mark as completed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRequest = async () => {
    try {
      setSubmitting(true);
      await requestChanges(project.id);
      alert("Change request sent!");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert("Failed to send change request.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- State: Deliverable has been submitted ---
  if (project.deliverable) {
    return (
      <div className="mt-4 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Deliverable</h4>
            <a
              href={project.deliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors group"
            >
              View delivered file
              <ExternalLink className="ml-1.5 h-4 w-4 text-gray-500 group-hover:text-cyan-300 transition-colors" />
            </a>
          </div>
          
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-400/30">
            Submitted
          </span>
        </div>

        {project.status !== "COMPLETED" && (
          <div className="mt-5 pt-5 border-t border-gray-700/80 flex flex-wrap gap-3">
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Mark as Completed
                </>
              )}
            </button>
            
            {project.status === "IN_REVIEW" && (
              <button
                onClick={handleChangeRequest}
                disabled={submitting}
                className="inline-flex items-center justify-center px-4 py-2 border border-amber-500/50 text-sm font-semibold rounded-lg shadow-sm text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Request Changes
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- State: Awaiting delivery ---
  return (
    <div className="mt-4 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80 shadow-lg">
      <h4 className="text-sm font-medium text-gray-400 mb-1">Deliverable</h4>
      <p className="text-gray-500 text-sm">Awaiting seller's delivery</p>
    </div>
  );
}