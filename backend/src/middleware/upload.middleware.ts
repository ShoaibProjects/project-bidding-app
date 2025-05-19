import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    return {
      folder: 'project-deliverables', // ✅ This is now valid
      format: file.mimetype.split('/')[1], // Automatically get format from mimetype
      public_id: file.originalname.split('.')[0], // Without extension
    };
  },
});

const upload = multer({ storage });

export default upload;
