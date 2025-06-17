import express, { RequestHandler } from "express";
import {
  createProject,
  getAllProjects,
  selectSeller,
  unselectSeller,
  completeProject,
  getSelectedProjectsForSeller,
  getProjectsByBuyerId,
  getProjectByProjectId,
  uploadDeliverable,
  requestChanges,
  updateProjectProgress,
  reuploadDeliverable,
  updateProjectDetails,
  cancelProject, 
} from "../controllers/project.controller";

import upload from "../middleware/upload.middleware";
import { requireAuth } from "../middleware/jwt.middleware";

const router = express.Router();

/**
 * Project Routes
 *
 * These routes handle all functionality related to creating, viewing,
 * managing, and completing projects in the application.
 * All routes are protected by JWT-based authentication middleware (`requireAuth`).
 */

// Route to create a new project
router.post("/", requireAuth as RequestHandler, createProject as RequestHandler);

// Route to get all projects (for buyers/sellers dashboard view)
router.get("/", getAllProjects as RequestHandler);

// Route for a buyer to select a seller's bid for a specific project
router.post("/:projectId/select-seller/:bidId", requireAuth as RequestHandler, selectSeller as RequestHandler);

// Route for a buyer to unselect a previously selected seller
router.post("/:projectId/unselect-seller", requireAuth as RequestHandler, unselectSeller as RequestHandler);

// Route to mark a project as completed
router.post("/:projectId/complete", requireAuth as RequestHandler, completeProject as RequestHandler);

// ✅ Route to cancel a project
router.post("/:projectId/cancel", requireAuth as RequestHandler, cancelProject as RequestHandler);

// Route to get all projects assigned to a specific seller
router.get("/selected-projects/seller/:sellerId", requireAuth as RequestHandler, getSelectedProjectsForSeller as RequestHandler);

// Route to get all projects created by a specific buyer
router.get("/buyer/:buyerId", requireAuth as RequestHandler, getProjectsByBuyerId as RequestHandler);

// Route to get details of a specific project
router.get("/:projectId", requireAuth as RequestHandler, getProjectByProjectId as RequestHandler);

// ✅ New route to update project details
router.patch("/:projectId", requireAuth as RequestHandler, updateProjectDetails as RequestHandler);

// Route to upload a deliverable file for a project (status → IN_REVIEW, progress → 100)
router.post(
  "/:projectId/upload",
  requireAuth as RequestHandler,
  upload.single("deliverable"), // Handle single file upload with key `deliverable`
  uploadDeliverable as RequestHandler
);

// Buyer requests changes on submitted deliverable (status → CHANGES_REQUESTED)
router.patch(
  "/:projectId/request-changes",
  requireAuth as RequestHandler,
  requestChanges as RequestHandler
);

// Seller manually updates project progress (0–99)
router.patch(
  "/:projectId/progress",
  requireAuth as RequestHandler,
  updateProjectProgress as RequestHandler
);

router.post(
  "/:projectId/reupload",
  requireAuth as RequestHandler,
  upload.single("deliverable"),
  reuploadDeliverable as RequestHandler
);

export default router;
