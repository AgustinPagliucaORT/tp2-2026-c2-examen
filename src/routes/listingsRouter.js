import express from "express";
import { getAllListings, getListingId, getListingsByType, getListingsWithPrice, getListingsByHost, patchListingAvailability, getHostRanking } from "../controllers/listingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authMiddleware, getAllListings);
router.get("/:id", getListingId);
router.get("/with-total-price", authMiddleware, getListingsWithPrice);
router.get("/property-type/:type", authMiddleware, getListingsByType);
router.get("/host/:host_id", authMiddleware, getListingsByHost);
router.patch("/:id/availability", authMiddleware, patchListingAvailability);
router.get("/top-hosts", authMiddleware, getHostRanking);

export default router;
