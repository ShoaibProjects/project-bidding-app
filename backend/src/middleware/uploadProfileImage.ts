import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary"; // Cloudinary instance/config

/**
 * File upload configuration for user profile pictures.
 *
 * This setup:
 * - Stores files in the 'profile-pictures' folder in Cloudinary
 * - Uses MIME type to determine format (e.g., png, jpg)
 * - Uses userId from request to create a unique public_id
 */

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userId = req.params.userId || (req as any).user.userId; // fallback if using auth

    if (!userId) {
      throw new Error("Missing userId in route parameters or request user.");
    }

    return {
      folder: "profile-pictures",
      format: file.mimetype.split("/")[1], // 'jpg', 'png', etc.
      public_id: userId, // Ensures 1 profile picture per user
    };
  },
});

const uploadProfileImage = multer({ storage });

export default uploadProfileImage;
