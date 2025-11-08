import express from "express";
import multer from "multer";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({ dest: "uploads/" });

router.get("/", getListings);
router.get("/:id", getListingById);
router.post("/", protect, upload.array("images", 10), createListing);
router.put("/:id", protect, upload.array("images", 10), updateListing);
router.delete("/:id", protect, deleteListing);

export default router;
