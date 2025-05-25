import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendEmail } from "../services/email.service";

/**
 * Creates a new project posted by a buyer.
 * Expects title, description, budget, deadline, and buyerId in req.body.
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, budget, deadline, buyerId } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget,
        deadline: new Date(deadline),
        buyerId,
      },
    });

    res.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

/**
 * Retrieves all pending projects (available for bidding).
 */
export const getAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "PENDING" },
      include: { bids: true, buyer: true },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

/**
 * Retrieves all projects created by a specific buyer.
 * buyerId is passed as a URL parameter.
 */
export const getProjectsByBuyerId = async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;

    const projects = await prisma.project.findMany({
      where: { buyerId },
      include: {
        bids: true,
        deliverable: true,
        selectedBid: true,
        rating: true,
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching buyer projects:", error);
    res.status(500).json({ error: "Failed to fetch projects for buyer" });
  }
};

/**
 * Retrieves a single project by its ID.
 * projectId is passed as a URL parameter.
 */
export const getProjectByProjectId = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { bids: true, buyer: true },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

/**
 * Allows a buyer to select a seller by choosing their bid.
 * Sends a notification email to the selected seller.
 */
export const selectSeller = async (req: Request, res: Response) => {
  try {
    const { projectId, bidId } = req.params;

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { seller: true },
    });

    if (!bid) return res.status(404).json({ error: "Bid not found" });

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: "IN_PROGRESS", selectedBidId: bidId },
    });

    await sendEmail(
      bid.seller.email,
      "You've been selected!",
      `Congrats! You've been selected for project: ${project.title}`
    );

    res.json(project);
  } catch (error) {
    console.error("Error selecting seller:", error);
    res.status(500).json({ error: "Failed to select seller" });
  }
};

/**
 * Allows a buyer to unselect a previously selected seller.
 * Notifies the seller, resets the project status to PENDING, and clears selectedBidId.
 */
export const unselectSeller = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Get the current project with selectedBid
    const currentProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        selectedBid: {
          include: { seller: true },
        },
      },
    });

    if (!currentProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const selectedSellerEmail = currentProject.selectedBid?.seller?.email;

    // Update the project: unselect seller
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "PENDING",
        selectedBidId: null,
      },
    });

    // Notify the previously selected seller if exists
    if (selectedSellerEmail) {
      await sendEmail(
        selectedSellerEmail,
        "You have been unselected",
        `The buyer has unselected you from project: "${currentProject.title}". The project is now open for bidding again.`
      );
    }

    res.json({
      message: "Seller unselected successfully. Project is now open for bidding.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error unselecting seller:", error);
    res.status(500).json({ error: "Failed to unselect seller" });
  }
};



/**
 * Marks a project as completed and sends notification emails to both buyer and seller.
 */
export const completeProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.update({
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
    await sendEmail(
      project.buyer.email,
      "Project completed",
      "Thank you for using our platform!"
    );
    await sendEmail(
      sellerEmail,
      "Project marked as completed",
      `The buyer has marked the project "${project.title}" as completed.`
    );

    res.json({ project });
  } catch (error) {
    console.error("Error completing project:", error);
    res.status(500).json({ error: "Failed to complete project" });
  }
};

/**
 * Retrieves all projects for which a seller has been selected.
 * sellerId is passed as a URL parameter.
 */
export const getSelectedProjectsForSeller = async (
  req: Request,
  res: Response
) => {
  try {
    const { sellerId } = req.params;

    const projects = await prisma.project.findMany({
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
  } catch (error) {
    console.error("Error fetching selected projects for seller:", error);
    res.status(500).json({ error: "Failed to fetch selected projects" });
  }
};

/**
 * Uploads a deliverable file for a specific project.
 * Requires file upload middleware like Multer.
 */
export const uploadDeliverable = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file || !(file as any).path) {
      return res
        .status(400)
        .json({ error: "No file uploaded or file path missing" });
    }

    const uploadedFileUrl = (file as any).path; // Cloudinary or local file path

    const deliverable = await prisma.deliverable.create({
      data: {
        fileUrl: uploadedFileUrl,
        projectId,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { buyer: true },
    });

    if (!project || !project.buyer) {
      return res.status(404).json({ error: "Project or buyer not found" });
    }

    await sendEmail(
      project.buyer.email,
      "New deliverable uploaded",
      `A deliverable has been uploaded for your project: "${project.title}". Please review it.`
    );

    res.json({ message: "Deliverable uploaded successfully", deliverable });
  } catch (error) {
    console.error("Upload deliverable error:", error);
    res.status(500).json({ error: "Failed to upload deliverable" });
  }
};
