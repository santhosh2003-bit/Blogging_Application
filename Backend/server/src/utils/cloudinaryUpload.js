import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogs_media",
    resource_type: "auto", // Automatically detect the file type
  },
});

const upload = multer({ storage });

export default upload;
