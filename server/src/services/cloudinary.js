const cloudinary = require("cloudinary").v2;

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

const uploadImageBuffer = (buffer, folder = "events") =>
  new Promise((resolve, reject) => {
    const options = { folder, resource_type: "image" };
    if (process.env.CLOUDINARY_UPLOAD_PRESET) {
      options.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }
    );

    stream.end(buffer);
  });

module.exports = { configureCloudinary, uploadImageBuffer };
