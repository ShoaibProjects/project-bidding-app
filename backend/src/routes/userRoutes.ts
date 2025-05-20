import express, { RequestHandler } from "express";
import { rateSeller } from "../controllers/user.controller";
import { requireAuth } from "../middleware/jwt.middleware";

const router = express.Router();

/**
 * @route   POST /
 * @desc    Rate a seller for a project
 * @access  Protected (requires JWT authentication)
 * 
 * This route allows an authenticated user (buyer) to submit a rating
 * for a seller associated with a specific project.
 * The `requireAuth` middleware ensures the user is authenticated before
 * accessing the controller logic.
 */
router.post("/", requireAuth as RequestHandler, rateSeller as RequestHandler);

export default router;
