"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBidsBySeller = exports.placeBid = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
/**
 * Place a bid on a project.
 * Expects sellerName, amount, durationDays, message, projectId, and sellerId in the request body.
 * Creates a new bid in the database and returns the created bid.
 */
const placeBid = async (req, res) => {
    const { sellerName, amount, durationDays, message, projectId, sellerId } = req.body;
    try {
        // Create a new bid in the database
        const bid = await prisma_1.default.bid.create({
            data: { sellerName, amount, durationDays, message, projectId, sellerId },
        });
        // Respond with the created bid
        res.status(201).json(bid);
    }
    catch (error) {
        console.error("Error placing bid:", error);
        res.status(500).json({ error: "Failed to place bid." });
    }
};
exports.placeBid = placeBid;
/**
 * Get all bids placed by a specific seller.
 * Expects sellerId as a route parameter.
 * Returns an array of bids including associated project details.
 */
const getBidsBySeller = async (req, res) => {
    const { sellerId } = req.params;
    try {
        // Find all bids made by this seller and include project info
        const bids = await prisma_1.default.bid.findMany({
            where: { sellerId },
            include: {
                project: true, // Include project data associated with the bid
            },
        });
        res.status(200).json(bids);
    }
    catch (error) {
        console.error("Error fetching bids by seller:", error);
        res.status(500).json({ error: "Failed to fetch bids." });
    }
};
exports.getBidsBySeller = getBidsBySeller;
