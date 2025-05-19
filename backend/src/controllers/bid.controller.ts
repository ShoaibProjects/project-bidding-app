import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const placeBid = async (req: Request, res: Response) => {
  const { sellerName, amount, durationDays, message, projectId, sellerId } = req.body;
  try {
      const bid = await prisma.bid.create({
    data: { sellerName, amount, durationDays, message, projectId, sellerId },
  });
  res.json(bid);
  } catch (error) {
    console.log(error)
    res.json(error)
  }
};

export const getBidsBySeller = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  try {
    const bids = await prisma.bid.findMany({
      where: { sellerId },
      include: {
        project: true, // optional: include project info for context
      },
    });

    res.json(bids);
  } catch (error) {
    console.error("Error fetching bids by seller:", error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
};