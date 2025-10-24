import express from 'express';
import { createUserSubscription, getUserSubscriptions, getSubscriptionById, deleteSubscription } from '../controllers/userSubscriptionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getUserSubscriptions);
router.get('/:id', protect, admin, getSubscriptionById);
router.post('/', protect, createUserSubscription);
router.delete('/:id', protect, admin, deleteSubscription);

export default router;
