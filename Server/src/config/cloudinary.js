import { v2 as cloudinary } from "cloudinary";

// console.log("Cloudinary env check:", {
//   CLOUD_NAME: !!process.env.CLOUD_NAME,
//   CLOUD_API_KEY: !!process.env.CLOUD_API_KEY,
//   CLOUD_API_SECRET: !!process.env.CLOUD_API_SECRET,
// });

if (
  !process.env.CLOUD_NAME ||
  !process.env.CLOUD_API_KEY ||
  !process.env.CLOUD_API_SECRET
) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;