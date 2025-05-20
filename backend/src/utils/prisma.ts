import { PrismaClient } from "@prisma/client";

// Instantiate a single PrismaClient instance to interact with the database
const prisma = new PrismaClient();

// Export the PrismaClient instance for use throughout the application
export default prisma;
