"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const jwt_middleware_1 = require("../middleware/jwt.middleware"); // Authentication middleware
const router = express_1.default.Router();
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
 * - POST /:projectId/complete           → Mark a project as completed
 * - GET /selected-projects/seller/:id   → Get projects assigned to a seller
 * - GET /buyer/:id                      → Get all projects created by a buyer
 * - GET /:projectId                     → Get details of a single project
 * - POST /:projectId/upload             → Upload a deliverable file for a project
 */
// Route to create a new project
router.post("/", jwt_middleware_1.requireAuth, project_controller_1.createProject);
// Route to get all projects (for buyers/sellers dashboard view)
router.get("/", jwt_middleware_1.requireAuth, project_controller_1.getAllProjects);
// Route for a buyer to select a seller's bid for a specific project
router.post("/:projectId/select-seller/:bidId", jwt_middleware_1.requireAuth, project_controller_1.selectSeller);
// Route to mark a project as completed
router.post("/:projectId/complete", jwt_middleware_1.requireAuth, project_controller_1.completeProject);
// Route to get all projects assigned to a specific seller
router.get("/selected-projects/seller/:sellerId", jwt_middleware_1.requireAuth, project_controller_1.getSelectedProjectsForSeller);
// Route to get all projects created by a specific buyer
router.get("/buyer/:buyerId", jwt_middleware_1.requireAuth, project_controller_1.getProjectsByBuyerId);
// Route to get details of a specific project
router.get("/:projectId", jwt_middleware_1.requireAuth, project_controller_1.getProjectByProjectId);
// Route to upload a deliverable file to a specific project
router.post("/:projectId/upload", jwt_middleware_1.requireAuth, upload_middleware_1.default.single("deliverable"), // Handle single file upload with key `deliverable`
project_controller_1.uploadDeliverable);
// Export router for use in main app
exports.default = router;
