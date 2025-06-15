import cron from "node-cron";
import prisma from "../utils/prisma";
import { sendEmail } from "./email.service";

/**
 * Schedules a cron job to check for projects with deadlines approaching within 24 hours.
 * The job runs every hour and sends reminders to both buyers (for bidding) and
 * selected sellers (for submission).
 */
export const scheduleDeadlineReminders = () => {
  // Schedule to run every hour at the beginning of the hour (e.g., 1:00, 2:00)
  cron.schedule("0 * * * *", async () => {
    console.log("Running hourly check for project deadline reminders...");

    try {
      const now = new Date();
      // Calculate the time 24 hours from now
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // --- 1. Find PENDING projects to remind BUYERS ---
      const pendingProjectsToRemind = await prisma.project.findMany({
        where: {
          deadline: {
            gte: now, // Deadline is in the future
            lte: twentyFourHoursFromNow, // Deadline is within the next 24 hours
          },
          reminderSent: false, // Reminder has not been sent yet
          status: "PENDING", // Only for projects still open for bidding
        },
        include: {
          buyer: true, // Include buyer details to get their email
        },
      });

      for (const project of pendingProjectsToRemind) {
        const { buyer, title, deadline } = project;
        const subject = `Reminder: Bidding Deadline Approaching - "${title}"`;
        const text = `
Hello ${buyer.name || 'Buyer'},

This is a reminder that the bidding deadline for your project, "${title}", is approaching.
The deadline is on: ${new Date(deadline).toLocaleString()}

Please ensure you review your bids and select a seller before the deadline.
Thank you for using our platform!
        `;
        await sendEmail(buyer.email, subject, text);
        console.log(`Bidding deadline reminder sent for project: "${title}" to buyer ${buyer.email}`);
        await prisma.project.update({
          where: { id: project.id },
          data: { reminderSent: true },
        });
      }

      // --- 2. Find IN_PROGRESS projects to remind SELLERS ---
      const inProgressProjectsToRemind = await prisma.project.findMany({
        where: {
          deadline: {
            gte: now,
            lte: twentyFourHoursFromNow,
          },
          reminderSent: false, // Using the same flag, assuming one reminder per deadline is sufficient
          status: "IN_PROGRESS",
          selectedBidId: { not: null }, // Ensure a seller is selected
        },
        include: {
          selectedBid: {
            include: {
              seller: true, // Include seller details to get their email
            },
          },
        },
      });

      for (const project of inProgressProjectsToRemind) {
        // Check if seller information is available
        if (project.selectedBid?.seller) {
          const { seller } = project.selectedBid;
          const { title, deadline } = project;
          const subject = `Reminder: Project Submission Deadline Approaching - "${title}"`;
          const text = `
Hello ${seller.name || 'Seller'},

This is a friendly reminder that the submission deadline for the project, "${title}", is approaching.
The deadline is on: ${new Date(deadline).toLocaleString()}

Please make sure to upload your deliverables on time.
Thank you for your hard work!
          `;

          await sendEmail(seller.email, subject, text);
          console.log(`Submission deadline reminder sent for project: "${title}" to seller ${seller.email}`);
          await prisma.project.update({
            where: { id: project.id },
            data: { reminderSent: true },
          });
        }
      }

      if (pendingProjectsToRemind.length === 0 && inProgressProjectsToRemind.length === 0) {
        console.log("No projects require a deadline reminder at this time.");
      }
    } catch (error) {
      console.error("Error sending deadline reminders:", error);
    }
  });
};
