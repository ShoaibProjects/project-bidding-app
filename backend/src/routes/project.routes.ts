import express, { RequestHandler } from "express";
import {
  createProject,
  getAllProjects,
  selectSeller,
  completeProject,
  getSelectedProjectsForSeller,
  getProjectsByBuyerId,
  getProjectByProjectId,
  uploadDeliverable
} from "../controllers/project.controller";
import upload from "../middleware/upload.middleware";
import { requireAuth } from "../middleware/jwt.middleware"; // import auth middleware

const router = express.Router();

// Protect all routes that need authentication
router.post("/", requireAuth as RequestHandler, createProject as RequestHandler);
router.get("/", requireAuth as RequestHandler, getAllProjects as RequestHandler);
router.post("/:projectId/select-seller/:bidId", requireAuth as RequestHandler, selectSeller as RequestHandler);
router.post("/:projectId/complete", requireAuth as RequestHandler, completeProject as RequestHandler);
router.get("/selected-projects/seller/:sellerId", requireAuth as RequestHandler, getSelectedProjectsForSeller as RequestHandler);
router.get("/buyer/:buyerId", requireAuth as RequestHandler, getProjectsByBuyerId as RequestHandler);
router.get("/:projectId", requireAuth as RequestHandler, getProjectByProjectId as RequestHandler);
router.post('/:projectId/upload', requireAuth as RequestHandler, upload.single('deliverable'), uploadDeliverable as RequestHandler);

export default router;
