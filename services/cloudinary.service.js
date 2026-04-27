require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadImage = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'products',
    resource_type: 'auto'
  });
  return result.secure_url;
};

exports.deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};