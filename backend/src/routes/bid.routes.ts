import express, { RequestHandler } from "express";
import { placeBid, getBidsBySeller } from "../controllers/bid.controller";
import { requireAuth } from "../middleware/jwt.middleware";

const router = express.Router();

/**
 * Bid Routes
 * 
 * This router handles endpoints related to project bids.
 * All routes are protected by the `requireAuth` middleware to ensure the user is authenticated.
 *
 * Routes:
 * - POST /           → Place a bid on a project
 * - GET /seller/:id  → Get all bids placed by a specific seller
 */

// Route to place a bid (requires authentication)
router.post("/", requireAuth as RequestHandler, placeBid as RequestHandler);

// Route to get all bids submitted by a specific seller (requires authentication)
router.get("/seller/:sellerId", requireAuth as RequestHandler, getBidsBySeller as RequestHandler);

// Export the router to be used in the main app
export default router;
