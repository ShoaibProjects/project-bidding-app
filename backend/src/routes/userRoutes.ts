import express, { RequestHandler } from "express";
import { rateSeller } from "../controllers/user.controller";
import { requireAuth } from "../middleware/jwt.middleware";
import { getUserById } from "../controllers/user.controller";

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

/**
 * @route   GET /:id
 * @desc    Get public user profile info by user ID
 * @access  Protected (requires JWT authentication)
 * 
 * Returns non-sensitive user data (excluding password).
 * Useful for displaying user profile information in the frontend.
 * 
 * Example: GET /users/abc123
 */
router.get("/:id", requireAuth as RequestHandler, getUserById as RequestHandler);

export default router;
