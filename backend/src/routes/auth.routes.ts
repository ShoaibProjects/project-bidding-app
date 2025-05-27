import express, { RequestHandler } from "express";
import { signupUser, loginUser, getCurrentUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/jwt.middleware";

const router = express.Router();

/**
 * Auth Routes
 * 
 * This router handles user authentication:
 * - POST /signup: Register a new user
 * - POST /login: Authenticate an existing user
 *
 * Controller methods are typecast to `RequestHandler` to satisfy TypeScript's type checking.
 */

// Route for user signup
router.post("/signup", signupUser as RequestHandler);

// Route for user login
router.post("/login", loginUser as RequestHandler);

// Auto-login route
router.get("/me", requireAuth as RequestHandler, getCurrentUser as RequestHandler); 

// Export the router to be used in the main app
export default router;
