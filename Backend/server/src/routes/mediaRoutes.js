import express from "express";
import upload from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* ---------------------- UPLOAD FILE ---------------------- */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    res.json({
      url: req.file.path, // Cloudinary CDN URL
      public_id: req.file.filename, // save this for delete
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ---------------------- GET ALL MEDIA ---------------------- */
router.get("/all", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: "blogs_media",
      max_results: 200,
    });

    res.json(resources.resources);
  } catch (err) {
    console.error("Cloudinary list error:", err);
    res.status(500).json({ message: "Error fetching images" });
  }
});

/* ---------------------- DELETE MEDIA ---------------------- */
router.delete("/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params;

    const data = await cloudinary.uploader.destroy(public_id, {
      resource_type: "auto",
    });
    console.log(data);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Error deleting media" });
  }
});

export default router;
