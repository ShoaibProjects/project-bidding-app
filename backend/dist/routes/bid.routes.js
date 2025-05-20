"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bid_controller_1 = require("../controllers/bid.controller");
const jwt_middleware_1 = require("../middleware/jwt.middleware");
const router = express_1.default.Router();
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
router.post("/", jwt_middleware_1.requireAuth, bid_controller_1.placeBid);
// Route to get all bids submitted by a specific seller (requires authentication)
router.get("/seller/:sellerId", jwt_middleware_1.requireAuth, bid_controller_1.getBidsBySeller);
// Export the router to be used in the main app
exports.default = router;
