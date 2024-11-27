const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = req.user ? req.user._id : 'unknown_user'; // Fallback for user ID
    return {
      folder: 'staffing',
      format: 'png', // Save as PNG
      public_id: userId, // Use user ID as the public_id
    };
  },
});

// Multer middleware
const upload = multer({ storage: storage });

module.exports = upload.single('picture');
