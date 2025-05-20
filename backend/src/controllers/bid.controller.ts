import { Request, Response } from "express";
import prisma from "../utils/prisma";

/**
 * Place a bid on a project.
 * Expects sellerName, amount, durationDays, message, projectId, and sellerId in the request body.
 * Creates a new bid in the database and returns the created bid.
 */
export const placeBid = async (req: Request, res: Response) => {
  const { sellerName, amount, durationDays, message, projectId, sellerId } = req.body;

  try {
    // Create a new bid in the database
    const bid = await prisma.bid.create({
      data: { sellerName, amount, durationDays, message, projectId, sellerId },
    });

    // Respond with the created bid
    res.status(201).json(bid);
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Failed to place bid." });
  }
};

/**
 * Get all bids placed by a specific seller.
 * Expects sellerId as a route parameter.
 * Returns an array of bids including associated project details.
 */
export const getBidsBySeller = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  try {
    // Find all bids made by this seller and include project info
    const bids = await prisma.bid.findMany({
      where: { sellerId },
      include: {
        project: true, // Include project data associated with the bid
      },
    });

    res.status(200).json(bids);
  } catch (error) {
    console.error("Error fetching bids by seller:", error);
    res.status(500).json({ error: "Failed to fetch bids." });
  }
};
