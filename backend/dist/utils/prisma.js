"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Instantiate a single PrismaClient instance to interact with the database
const prisma = new client_1.PrismaClient();
// Export the PrismaClient instance for use throughout the application
exports.default = prisma;
