const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function isCloudinaryEnabled() {
  return isConfigured;
}

/**
 * Upload an image file to Cloudinary.
 * @param {string} filePath - Absolute path to local file.
 * @param {string} folder - Folder name in Cloudinary (default: 'vietcraft/printing-shop/blanks')
 * @returns {Promise<{ url: string, public_id: string, format: string, bytes: number }>}
 */
async function uploadToCloudinary(filePath, folder = 'vietcraft/printing-shop/blanks') {
  if (!isCloudinaryEnabled()) {
    throw new Error('Cloudinary chưa được cấu hình.');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
    overwrite: false
  });

  return {
    url: result.secure_url || result.url,
    public_id: result.public_id,
    format: result.format,
    bytes: result.bytes
  };
}

module.exports = {
  isCloudinaryEnabled,
  uploadToCloudinary,
  cloudinary
};
