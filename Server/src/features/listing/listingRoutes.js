import express from "express";
import upload from "../../middleware/uploadMiddleware.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/authRolesMiddleware.js";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  deleteListingImage,
} from "./listingController.js";

const router = express.Router();

router.get("/", getListings);
router.get("/:id", getListing);

router.post(
  "/",
  protect,
  authorizeRoles("host"),
  upload.array("images", 10),
  createListing
);

router.put(
  "/:id",
  protect,
  authorizeRoles("host"),
  upload.array("images", 10),
  updateListing
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("host"),
  deleteListing
);

router.delete(
  "/:id/images",
  protect,
  authorizeRoles("host"),
  deleteListingImage
);

export default router;