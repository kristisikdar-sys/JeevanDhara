import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { predictAvailability } from '../controllers/predictController.js';

const router = Router();

router.use(authenticate);
router.post('/', predictAvailability);

export default router;