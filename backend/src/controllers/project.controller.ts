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

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "IN_REVIEW",
        progress: 100,
      },
      include: { buyer: true },
    });

    if (!updatedProject || !updatedProject.buyer) {
      return res.status(404).json({ error: "Project or buyer not found" });
    }

    await sendEmail(
      updatedProject.buyer.email,
      "Deliverable Uploaded",
      `A deliverable has been uploaded for your project "${updatedProject.title}". Please review it.`
    );

    res.json({ message: "Deliverable uploaded successfully", deliverable, project: updatedProject });
  } catch (error) {
    console.error("Upload deliverable error:", error);
    res.status(500).json({ error: "Failed to upload deliverable" });
  }
};

/**
 * Allows the buyer to request changes on a submitted deliverable.
 */
export const requestChanges = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "CHANGES_REQUESTED",
      },
      include: {
        selectedBid: { include: { seller: true } },
        buyer: true,
      },
    });

    if (!updatedProject.selectedBid?.seller) {
      return res.status(400).json({ error: "No seller selected for this project" });
    }

    await sendEmail(
      updatedProject.selectedBid.seller.email,
      "Changes Requested",
      `The buyer has requested changes on the project "${updatedProject.title}". Please review and resubmit.`
    );

    res.json({ message: "Changes requested successfully", project: updatedProject });
  } catch (error) {
    console.error("Request changes error:", error);
    res.status(500).json({ error: "Failed to request changes" });
  }
};

/**
 * Allows the seller to update the progress of the project manually (0–99).
 * Prevents setting progress to 100 (done automatically on deliverable).
 */
export const updateProjectProgress = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { progress } = req.body;

    if (typeof progress !== "number" || progress < 0 || progress >= 100) {
      return res.status(400).json({ error: "Progress must be a number between 0 and 99" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });

    res.json({ message: "Progress updated successfully", project: updatedProject });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ error: "Failed to update project progress" });
  }
};

export const reuploadDeliverable = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file || !(file as any).path) {
      return res.status(400).json({ error: "No file uploaded or file path missing" });
    }

    const uploadedFileUrl = (file as any).path;

    // Either update or create deliverable entry (upsert-like logic)
    const existingDeliverable = await prisma.deliverable.findFirst({
      where: { projectId },
    });

    const deliverable = existingDeliverable
      ? await prisma.deliverable.update({
          where: { id: existingDeliverable.id },
          data: { fileUrl: uploadedFileUrl },
        })
      : await prisma.deliverable.create({
          data: { projectId, fileUrl: uploadedFileUrl },
        });

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: "IN_REVIEW" },
      include: { buyer: true },
    });

    await sendEmail(
      updatedProject.buyer.email,
      "Deliverable Re-Uploaded",
      `A revised deliverable has been re-uploaded for your project "${updatedProject.title}". Please review it.`
    );

    res.json({
      message: "Deliverable re-uploaded successfully",
      deliverable,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error reuploading deliverable:", error);
    res.status(500).json({ error: "Failed to re-upload deliverable" });
  }
};

/**
 * Updates the details (title, description, deadline) of a project.
 * Only the buyer who created the project can update it.
 * Notifies the selected seller if the project is in progress.
 */
export const updateProjectDetails = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title, description, deadline } = req.body;
        const userId = (req as any).user?.userId; // Assuming userId is attached by requireAuth middleware

        // 1. Find the project and verify ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (project.buyerId !== userId) {
            return res.status(403).json({ error: "You are not authorized to edit this project" });
        }

        // 2. Prepare the data for update
        const updateData: {
            title?: string;
            description?: string;
            deadline?: Date;
            reminderSent?: boolean;
        } = {};

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (deadline) {
            updateData.deadline = new Date(deadline);
            // Reset reminder flag so the cron job can send a new one for the new date
            updateData.reminderSent = false;
        }
        
        // Check if there is anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update information provided" });
        }

        // 3. Update the project
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData,
            include: {
                selectedBid: {
                    include: {
                        seller: true,
                    },
                },
            },
        });

        // 4. Notify seller if project is in progress
        if (updatedProject.status === 'IN_PROGRESS' && updatedProject.selectedBid?.seller) {
            const seller = updatedProject.selectedBid.seller;
            const subject = `Project Updated: "${updatedProject.title}"`;
            const text = `
Hello ${seller.name || 'Seller'},

The details for a project you are working on, "${updatedProject.title}", have been updated by the buyer.
Please log in to your dashboard to review the changes.

Thank you.
            `;
            await sendEmail(seller.email, subject, text);
        }

        res.json(updatedProject);
    } catch (error) {
        console.error("Error updating project details:", error);
        res.status(500).json({ error: "Failed to update project details" });
    }
};

/**
 * Allows a buyer to cancel their project.
 * Sends notification email to the selected seller if there is one.
 * Updates project status to CANCELLED (you'll need to add this to your ProjectStatus enum).
 */
export const cancelProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user?.userId; // Assuming userId is attached by requireAuth middleware

    // 1. Find the project and verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        selectedBid: {
          include: {
            seller: true,
          },
        },
        buyer: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 2. Verify that the requesting user is the buyer who created the project
    if (project.buyerId !== userId) {
      return res.status(403).json({ error: "You are not authorized to cancel this project" });
    }

    // 3. Check if project can be cancelled (optional business logic)
    if (project.status === "COMPLETED") {
      return res.status(400).json({ error: "Cannot cancel a completed project" });
    }

    // 4. Update the project status to cancelled
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "CANCELLED", // You'll need to add this to your ProjectStatus enum
        selectedBidId: null, // Clear the selected bid
      },
      include: {
        buyer: true,
        selectedBid: {
          include: {
            seller: true,
          },
        },
      },
    });

    // 5. Notify the selected seller if there was one
    if (project.selectedBid?.seller) {
      const seller = project.selectedBid.seller;
      const subject = `Project Cancelled: "${project.title}"`;
      const text = `
Hello ${seller.name || 'Seller'},

We regret to inform you that the project "${project.title}" has been cancelled by the buyer.

Project Details:
- Title: ${project.title}
- Description: ${project.description}
- Budget: ${project.budget}

If you have any questions, please contact our support team.

Thank you for your understanding.
      `;
      
      await sendEmail(seller.email, subject, text);
    }

    // 6. Send confirmation email to buyer
    if (project.buyer) {
      const subject = `Project Cancelled: "${project.title}"`;
      const text = `
Hello ${project.buyer.name || 'Buyer'},

Your project "${project.title}" has been successfully cancelled.

${project.selectedBid?.seller ? 'The selected seller has been notified about the cancellation.' : ''}

Thank you for using our platform.
      `;
      
      await sendEmail(project.buyer.email, subject, text);
    }

    res.json({
      message: "Project cancelled successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error cancelling project:", error);
    res.status(500).json({ error: "Failed to cancel project" });
  }
};
