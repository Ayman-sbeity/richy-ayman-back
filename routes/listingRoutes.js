import express from 'express';
import { createListing, getListings, getListingById, updateListing, deleteListing } from '../controllers/listingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;
