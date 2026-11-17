const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Cloudinary storage for profile photos */
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ridewala/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

/** Cloudinary storage for rider documents */
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ridewala/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  },
});

/** Cloudinary storage for vehicle images */
const _vehicleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ridewala/vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.'), false);
  }
};

/** Upload middleware for a single profile photo */
const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
}).single('profilePhoto');

/** Upload middleware for rider registration (licence + vehicle + multiple docs) */
const uploadRiderDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
}).fields([
  { name: 'licenceImage', maxCount: 1 },
  { name: 'vehicleImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);

module.exports = { uploadProfilePhoto, uploadRiderDocuments, cloudinary };
