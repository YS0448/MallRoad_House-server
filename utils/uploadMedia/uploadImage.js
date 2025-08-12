const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const uploadImage = async (image) => {
  // Validate file type
  const allowedExtensions = /\.(png|jpg|jpeg|webp)$/i;
  if (!allowedExtensions.test(image.name)) {
    throw new Error("Invalid image type. Allowed types: png, jpg, jpeg, webp");
  }

  // ✅ Create uploads folder at project root
  const uploadDir = path.resolve("uploads/images/food_image");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate unique file name
  const ext = path.extname(image.name).toLowerCase();
  const fileName = `${uuidv4()}${ext}`;
  const savePath = path.join(uploadDir, fileName);

  // Move the file
  await image.mv(savePath);

  // Return relative path to serve the file later
  return `/uploads/images/food_image/${fileName}`;
};

module.exports = uploadImage;
