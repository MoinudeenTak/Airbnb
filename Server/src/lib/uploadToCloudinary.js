// utils/uploadToCloudinary.js
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "airbnb/listings",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("CLOUDINARY UPLOAD ERROR:", error);
            return reject(error);
          }

          console.log("CLOUDINARY UPLOAD SUCCESS:", {
            secure_url: result?.secure_url,
            public_id: result?.public_id,
          });

          resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(stream);
    } catch (error) {
      console.error("UPLOAD STREAM ERROR:", error);
      reject(error);
    }
  });
};

export default uploadToCloudinary;