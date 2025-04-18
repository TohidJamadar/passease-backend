// Import required packages
import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer"; // For handling multipart/form-data
import fs from "fs"; // To delete temp files after upload

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// JSON parser middleware
app.use(express.json());

// Cloudinary config using environment variables from .env
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Multer config: store files temporarily in /uploads folder
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
    res.send("Hello world");
});

/**
 * Upload route
 * This accepts a single image and a single document file
 * Frontend should send form-data with fields: image, doc
 */
app.post("/upload", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "doc", maxCount: 1 },
]), async (req, res) => {
    try {
        // Access uploaded files
        const imageFile = req.files.image[0];
        const docFile = req.files.doc[0];

        // Upload image to Cloudinary (default 'image' resource_type)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: "uploads/images", // Optional: put in subfolder
        });

        // Upload doc to Cloudinary (specify resource_type as 'raw' for non-images)
        const docUpload = await cloudinary.uploader.upload(docFile.path, {
            resource_type: "raw",
            folder: "uploads/docs", // Optional
        });

        // Delete temp files after upload
        fs.unlinkSync(imageFile.path);
        fs.unlinkSync(docFile.path);

        // Send Cloudinary URLs in response
        res.status(200).json({
            image: imageUpload.secure_url,
            doc: docUpload.secure_url,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
