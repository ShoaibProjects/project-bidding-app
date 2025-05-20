import { Request, Response } from "express";
import prisma from "../utils/prisma";

/**
 * Rate a seller for a completed project.
 * 
 * This endpoint allows a buyer to rate a seller (1–5 stars) and leave an optional comment,
 * but only if the buyer owns the project and the seller was selected for that project.
 * The seller’s average rating is recalculated and updated.
 * 
 * Expects: { value, comment?, projectId } in request body.
 * Requires authenticated user (buyer) with userId attached to `req.user`.
 */
export const rateSeller = async (req: Request, res: Response) => {
  const { value, comment, projectId } = req.body;
  const buyerId = (req as any).user.userId; // Assumes auth middleware sets `user` on request

  // Validate required inputs
  if (!value || !projectId) {
    return res.status(400).json({ error: "Rating value and projectId are required." });
  }

  // Validate rating range
  if (value < 1 || value > 5) {
    return res.status(400).json({ error: "Rating value must be between 1 and 5." });
  }

  try {
    // Fetch the project with selected bid
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        selectedBid: true
      }
    });

    // Ensure project exists
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Ensure the authenticated user is the buyer
    if (project.buyerId !== buyerId) {
      return res.status(403).json({ error: "You are not authorized to rate this project." });
    }

    // Ensure a seller was selected for this project
    if (!project.selectedBid) {
      return res.status(400).json({ error: "Seller not selected for this project." });
    }

    const sellerId = project.selectedBid.sellerId;

    // Prevent duplicate ratings for the same project by the same buyer
    const existing = await prisma.rating.findFirst({
      where: { buyerId, sellerId, projectId }
    });

    if (existing) {
      return res.status(400).json({ error: "You have already rated this seller for this project." });
    }

    // Save new rating to the database
    await prisma.rating.create({
      data: {
        value,
        comment,
        buyerId,
        sellerId,
        projectId
      }
    });

    // Fetch all ratings for the seller to recalculate average
    const ratings = await prisma.rating.findMany({
      where: { sellerId }
    });

    const average = ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length;

    // Update seller's average rating on their profile
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        rating: average
      }
    });

    return res.status(201).json({ message: "Seller rated successfully." });
  } catch (err) {
    console.error("Rate Seller Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
