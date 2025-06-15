import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary'; // Cloudinary instance/config

/**
 * File upload configuration using multer and Cloudinary.
 *
 * This setup:
 * - Stores files in the 'project-deliverables' folder in Cloudinary
 * - Uses the file's MIME type to determine format (e.g., png, jpg, pdf)
 * - Uses the original filename (without extension) as the Cloudinary public_id
 */

// Create a storage engine that tells multer how to upload to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary, // Your initialized Cloudinary instance
  params: async (req, file) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new Error("Missing projectId in route parameters.");
    }

    return {
      folder: "project-deliverables", // Target folder in Cloudinary
      format: file.mimetype.split("/")[1], // Extracts format (e.g., 'pdf', 'png')
      public_id: projectId, // Overwrites existing file with same projectId
    };
  },
});

// Create the multer instance with the Cloudinary storage engine
const upload = multer({ storage });

// Export the configured multer middleware for use in routes
export default upload;
