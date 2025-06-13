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
  uploadDeliverable
} from "../controllers/project.controller";

import upload from "../middleware/upload.middleware";
import { requireAuth } from "../middleware/jwt.middleware"; // Authentication middleware

const router = express.Router();

/**
 * Project Routes
 * 
 * These routes handle all functionality related to creating, viewing,
 * managing, and completing projects in the application. All routes are protected
 * by JWT-based authentication middleware (`requireAuth`).
 * 
 * Endpoints:
 * - POST /                              → Create a new project
 * - GET /                               → Get all projects
 * - POST /:projectId/select-seller/:bidId → Select a seller for a project
 * - POST /:projectId/unselect-seller    → Unselect a seller from a project
 * - POST /:projectId/complete           → Mark a project as completed
 * - GET /selected-projects/seller/:id   → Get projects assigned to a seller
 * - GET /buyer/:id                      → Get all projects created by a buyer
 * - GET /:projectId                     → Get details of a single project
 * - POST /:projectId/upload             → Upload a deliverable file for a project
 */

// Route to create a new project
router.post("/", requireAuth as RequestHandler, createProject as RequestHandler);

// Route to get all projects (for buyers/sellers dashboard view)
router.get("/",  getAllProjects as RequestHandler);

// Route for a buyer to select a seller's bid for a specific project
router.post("/:projectId/select-seller/:bidId", requireAuth as RequestHandler, selectSeller as RequestHandler);

// Route for a buyer to unselect a previously selected seller
router.post("/:projectId/unselect-seller", requireAuth as RequestHandler, unselectSeller as RequestHandler);

// Route to mark a project as completed
router.post("/:projectId/complete", requireAuth as RequestHandler, completeProject as RequestHandler);

// Route to get all projects assigned to a specific seller
router.get("/selected-projects/seller/:sellerId", requireAuth as RequestHandler, getSelectedProjectsForSeller as RequestHandler);

// Route to get all projects created by a specific buyer
router.get("/buyer/:buyerId", requireAuth as RequestHandler, getProjectsByBuyerId as RequestHandler);

// Route to get details of a specific project
router.get("/:projectId", requireAuth as RequestHandler, getProjectByProjectId as RequestHandler);

// Route to upload a deliverable file to a specific project
router.post(
  "/:projectId/upload",
  requireAuth as RequestHandler,
  upload.single("deliverable"), // Handle single file upload with key `deliverable`
  uploadDeliverable as RequestHandler
);

// Export router for use in main app
export default router;
