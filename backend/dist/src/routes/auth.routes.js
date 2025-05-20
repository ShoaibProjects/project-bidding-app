"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
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
router.post("/signup", auth_controller_1.signupUser);
// Route for user login
router.post("/login", auth_controller_1.loginUser);
// Export the router to be used in the main app
exports.default = router;
