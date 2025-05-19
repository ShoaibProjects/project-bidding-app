import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendEmail } from "../services/email.service";

export const createProject = async (req: Request, res: Response) => {
  try {
      const { title, description, budget, deadline, buyerId } = req.body;
  const project = await prisma.project.create({
    data: { title, description, budget, deadline: new Date(deadline), buyerId },
  });
  res.json(project);
  } catch (error) {
    console.log(error)
    res.json(error)
  }
};

export const getAllProjects = async (_req: Request, res: Response) => {
  try {
      const projects = await prisma.project.findMany({
    where: { status: "PENDING" },
    include: { bids: true, buyer: true },
  });
  res.json(projects);
  } catch (error) {
    console.log(error)
  }
};

export const getProjectsByBuyerId = async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;

    const projects = await prisma.project.findMany({
      where: { buyerId: buyerId },
      include: { bids: true, deliverable: true, selectedBid: true },
    });

    res.json(projects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch projects for buyer" });
  }
};


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
    console.log(error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};


export const selectSeller = async (req: Request, res: Response) => {
  const { projectId, bidId } = req.params;

  const bid = await prisma.bid.findUnique({ where: { id: bidId }, include: { seller: true } });
  if (!bid) return res.status(404).json({ error: "Bid not found" });

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "IN_PROGRESS",
            selectedBidId: bidId,
     },
  });

  await sendEmail(
    bid.seller.email,
    "You've been selected!",
    `Congrats! You've been selected for project: ${project.title}`
  );

  res.json(project);
};

//   const { projectId } = req.params;
//   const { fileUrl } = req.body;

//   const deliverable = await prisma.deliverable.create({
//     data: { fileUrl, projectId },
//   });

//   const updated = await prisma.project.update({
//     where: { id: projectId },
//     data: { status: "COMPLETED" },
//     include: { buyer: true, bids: { include: { seller: true } } },
//   });

//   const sellerEmail = updated.bids[0]?.seller?.email;
//   await sendEmail(updated.buyer.email, "Project completed", "Please review deliverables.");
//   if (sellerEmail) {
//     await sendEmail(sellerEmail, "Project marked as completed", "Thank you for your work!");
//   }

//   res.json({ project: updated, deliverable });
// };


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
      return res.status(400).json({ error: "No seller selected for this project" });
    }

    const sellerEmail = project.selectedBid.seller.email;

    // Notify buyer and seller
    await sendEmail(project.buyer.email, "Project completed", "Thank you for using our platform!");
    await sendEmail(sellerEmail, "Project marked as completed", `The buyer has marked the project "${project.title}" as completed.`);

    res.json({ project });
  } catch (error) {
    console.error("Error completing project:", error);
    res.status(500).json({ error: "Failed to complete project" });
  }
};


export const getSelectedProjectsForSeller = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  try {
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
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching selected projects for seller:', error);
    res.status(500).json({ error: 'Failed to fetch selected projects' });
  }
};

//   try {
//     const { projectId } = req.params;

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const fileUrl = `/uploads/${req.file.filename}`;

//     const deliverable = await prisma.deliverable.create({
//       data: {
//         fileUrl,
//         projectId,
//       },
//     });

//     // Get project and buyer info
//     const project = await prisma.project.findUnique({
//       where: { id: projectId },
//       include: { buyer: true },
//     });

//     if (!project || !project.buyer) {
//       return res.status(404).json({ error: "Project or buyer not found" });
//     }

//     // Send email to buyer
//     await sendEmail(
//       project.buyer.email,
//       "New deliverable uploaded",
//       `A deliverable has been uploaded for your project: "${project.title}". Please review it.`
//     );

//     res.json({ message: "Deliverable uploaded successfully", deliverable });
//   } catch (error) {
//     console.error("Upload deliverable error:", error);
//     res.status(500).json({ error: "Failed to upload deliverable" });
//   }
// };

export const uploadDeliverable = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const file = req.file as Express.Multer.File;


    if (!file || !(file as any).path) {
      return res.status(400).json({ error: "No file uploaded or file path missing" });
    }

    const uploadedFileUrl = (file as any).path; // Cloudinary file URL

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
