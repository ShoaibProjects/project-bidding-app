"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const jwt_middleware_1 = require("../middleware/jwt.middleware");
const router = express_1.default.Router();
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
router.post("/", jwt_middleware_1.requireAuth, user_controller_1.rateSeller);
exports.default = router;
