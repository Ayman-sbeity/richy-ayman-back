import express from 'express';
import { 
  getCurrentUserSubscription,
  createUserSubscription, 
  updateUserSubscription,
  cancelUserSubscription,
  getUserSubscriptions, 
  getSubscriptionById, 
  deleteSubscription 
} from '../controllers/userSubscriptionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User endpoints (more specific routes first)
router.get('/current', protect, getCurrentUserSubscription);
router.post('/', protect, createUserSubscription);
router.put('/', protect, updateUserSubscription);
router.delete('/', protect, cancelUserSubscription);

// Admin endpoints (less specific routes last)
router.get('/all', protect, admin, getUserSubscriptions);
router.get('/:id', protect, admin, getSubscriptionById);
router.delete('/:id', protect, admin, deleteSubscription);

export default router;
