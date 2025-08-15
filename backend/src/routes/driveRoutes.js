import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { suggestHotspots } from '../controllers/driveController.js';

const router = Router();

router.use(authenticate);
router.get('/suggest', suggestHotspots);

export default router;