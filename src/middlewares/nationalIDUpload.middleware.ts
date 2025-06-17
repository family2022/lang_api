import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from '../utils/env';

// Define the directory for storing national ID uploads
const uploadDirectory = path.join(env.FILE_UPLOAD_PATH, 'uploads/national_id/');
// Ensure the upload directory exists before storing files
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if the directory exists, create it if it doesn't
    fs.access(uploadDirectory, fs.constants.W_OK, (err) => {
      if (err) {
        return cb(new Error('Upload directory is not writable'), '');
      }
      cb(null, uploadDirectory);
    });
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid overwriting files
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// Create the multer instance with the defined storage configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Set a file size limit (e.g., 5MB)
  },
  fileFilter: (req, file, cb) => {
    // Validate file types (optional, e.g., only images or PDFs)
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Export the middleware to handle a single file upload with field name 'nationalId'
export const uploadNationalId = upload.single('nationalId');
