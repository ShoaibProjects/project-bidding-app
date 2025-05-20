"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary")); // Cloudinary instance/config
/**
 * File upload configuration using multer and Cloudinary.
 *
 * This setup:
 * - Stores files in the 'project-deliverables' folder in Cloudinary
 * - Uses the file's MIME type to determine format (e.g., png, jpg, pdf)
 * - Uses the original filename (without extension) as the Cloudinary public_id
 */
// Create a storage engine that tells multer how to upload to Cloudinary
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default, // Your initialized Cloudinary instance
    params: async (_req, file) => {
        return {
            folder: 'project-deliverables', // Target folder in Cloudinary
            format: file.mimetype.split('/')[1], // e.g., 'image/png' → 'png'
            public_id: file.originalname.split('.')[0], // e.g., 'report.pdf' → 'report'
        };
    },
});
// Create the multer instance with the Cloudinary storage engine
const upload = (0, multer_1.default)({ storage });
// Export the configured multer middleware for use in routes
exports.default = upload;
