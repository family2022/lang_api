import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from '../utils/env';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the upload type
    const uploadType = 'landfile'; // Hardcoded for now, or use req.params.uploadType if passed as a parameter
    let uploadPath;

    // Define paths based on upload type
    if (uploadType === 'landfile') {
      uploadPath = path.join(env.FILE_UPLOAD_PATH, 'uploads/land_files/');
    } else if (uploadType === 'landtransferfile') {
      uploadPath = path.join(
        env.FILE_UPLOAD_PATH,
        'uploads/land_transfer_files/'
      );
    } else {
      return cb(new Error('Invalid upload type'), '');
    }

    // Check if directory exists, if not, create it
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        return cb(new Error('Failed to create upload directory'), '');
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

export const uploadMultipleFiles = upload.array('files');
