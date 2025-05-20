"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDeliverable = exports.getSelectedProjectsForSeller = exports.completeProject = exports.selectSeller = exports.getProjectByProjectId = exports.getProjectsByBuyerId = exports.getAllProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const email_service_1 = require("../services/email.service");
/**
 * Creates a new project posted by a buyer.
 * Expects title, description, budget, deadline, and buyerId in req.body.
 */
const createProject = async (req, res) => {
    try {
        const { title, description, budget, deadline, buyerId } = req.body;
        const project = await prisma_1.default.project.create({
            data: {
                title,
                description,
                budget,
                deadline: new Date(deadline),
                buyerId,
            },
        });
        res.json(project);
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
};
exports.createProject = createProject;
/**
 * Retrieves all pending projects (available for bidding).
 */
const getAllProjects = async (_req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            where: { status: "PENDING" },
            include: { bids: true, buyer: true },
        });
        res.json(projects);
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};
exports.getAllProjects = getAllProjects;
/**
 * Retrieves all projects created by a specific buyer.
 * buyerId is passed as a URL parameter.
 */
const getProjectsByBuyerId = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const projects = await prisma_1.default.project.findMany({
            where: { buyerId },
            include: {
                bids: true,
                deliverable: true,
                selectedBid: true,
                rating: true,
            },
        });
        res.json(projects);
    }
    catch (error) {
        console.error("Error fetching buyer projects:", error);
        res.status(500).json({ error: "Failed to fetch projects for buyer" });
    }
};
exports.getProjectsByBuyerId = getProjectsByBuyerId;
/**
 * Retrieves a single project by its ID.
 * projectId is passed as a URL parameter.
 */
const getProjectByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
            include: { bids: true, buyer: true },
        });
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        res.json(project);
    }
    catch (error) {
        console.error("Error fetching project by ID:", error);
        res.status(500).json({ error: "Failed to fetch project" });
    }
};
exports.getProjectByProjectId = getProjectByProjectId;
/**
 * Allows a buyer to select a seller by choosing their bid.
 * Sends a notification email to the selected seller.
 */
const selectSeller = async (req, res) => {
    try {
        const { projectId, bidId } = req.params;
        const bid = await prisma_1.default.bid.findUnique({
            where: { id: bidId },
            include: { seller: true },
        });
        if (!bid)
            return res.status(404).json({ error: "Bid not found" });
        const project = await prisma_1.default.project.update({
            where: { id: projectId },
            data: { status: "IN_PROGRESS", selectedBidId: bidId },
        });
        await (0, email_service_1.sendEmail)(bid.seller.email, "You've been selected!", `Congrats! You've been selected for project: ${project.title}`);
        res.json(project);
    }
    catch (error) {
        console.error("Error selecting seller:", error);
        res.status(500).json({ error: "Failed to select seller" });
    }
};
exports.selectSeller = selectSeller;
/**
 * Marks a project as completed and sends notification emails to both buyer and seller.
 */
const completeProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma_1.default.project.update({
            where: { id: projectId },
            data: { status: "COMPLETED" },
            include: {
                buyer: true,
                selectedBid: { include: { seller: true } },
            },
        });
        if (!project.selectedBid?.seller) {
            return res
                .status(400)
                .json({ error: "No seller selected for this project" });
        }
        const sellerEmail = project.selectedBid.seller.email;
        // Notify both buyer and seller
        await (0, email_service_1.sendEmail)(project.buyer.email, "Project completed", "Thank you for using our platform!");
        await (0, email_service_1.sendEmail)(sellerEmail, "Project marked as completed", `The buyer has marked the project "${project.title}" as completed.`);
        res.json({ project });
    }
    catch (error) {
        console.error("Error completing project:", error);
        res.status(500).json({ error: "Failed to complete project" });
    }
};
exports.completeProject = completeProject;
/**
 * Retrieves all projects for which a seller has been selected.
 * sellerId is passed as a URL parameter.
 */
const getSelectedProjectsForSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const projects = await prisma_1.default.project.findMany({
            where: {
                selectedBid: {
                    sellerId: sellerId,
                },
            },
            include: {
                selectedBid: true,
                buyer: true,
                deliverable: true,
                rating: true,
            },
        });
        res.json(projects);
    }
    catch (error) {
        console.error("Error fetching selected projects for seller:", error);
        res.status(500).json({ error: "Failed to fetch selected projects" });
    }
};
exports.getSelectedProjectsForSeller = getSelectedProjectsForSeller;
/**
 * Uploads a deliverable file for a specific project.
 * Requires file upload middleware like Multer.
 */
const uploadDeliverable = async (req, res) => {
    try {
        const { projectId } = req.params;
        const file = req.file;
        if (!file || !file.path) {
            return res
                .status(400)
                .json({ error: "No file uploaded or file path missing" });
        }
        const uploadedFileUrl = file.path; // Cloudinary or local file path
        const deliverable = await prisma_1.default.deliverable.create({
            data: {
                fileUrl: uploadedFileUrl,
                projectId,
            },
        });
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
            include: { buyer: true },
        });
        if (!project || !project.buyer) {
            return res.status(404).json({ error: "Project or buyer not found" });
        }
        await (0, email_service_1.sendEmail)(project.buyer.email, "New deliverable uploaded", `A deliverable has been uploaded for your project: "${project.title}". Please review it.`);
        res.json({ message: "Deliverable uploaded successfully", deliverable });
    }
    catch (error) {
        console.error("Upload deliverable error:", error);
        res.status(500).json({ error: "Failed to upload deliverable" });
    }
};
exports.uploadDeliverable = uploadDeliverable;
