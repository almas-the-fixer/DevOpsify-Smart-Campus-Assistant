import dotenv from "dotenv";
import cloudinary from "cloudinary";

// Load env HERE also
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});



export default cloudinary.v2;
