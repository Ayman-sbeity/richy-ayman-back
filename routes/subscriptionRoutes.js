import express from 'express';
import { createPlan, getPlans, getPlanById, updatePlan, deletePlan } from '../controllers/subscriptionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', protect, admin, createPlan);
router.put('/:id', protect, admin, updatePlan);
router.delete('/:id', protect, admin, deletePlan);

export default router;
