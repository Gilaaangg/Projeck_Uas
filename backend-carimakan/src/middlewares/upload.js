const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const ALLOWED_TYPES = /jpeg|jpg|png|webp/;
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isValid = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase())
    && ALLOWED_TYPES.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.'), false);
  }
};

// Upload untuk gambar menu
const uploadMenuImage = multer({
  storage: createStorage('menus'),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).single('image'); // field name: "image"

// Upload untuk logo/banner toko
const uploadStoreImage = multer({
  storage: createStorage('stores'),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

// Wrapper agar error multer masuk ke express error handler
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  uploadMenuImage: handleUpload(uploadMenuImage),
  uploadStoreImage: handleUpload(uploadStoreImage),
};
