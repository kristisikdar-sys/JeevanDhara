import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createRequest, getNearbyRequests, updateRequestStatus } from '../controllers/requestController.js';

const router = Router();

router.use(authenticate);
router.get('/', getNearbyRequests);
router.post('/', createRequest);
router.patch('/:id/status', updateRequestStatus);

export default router;