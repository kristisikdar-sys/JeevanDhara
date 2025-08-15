import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getEraktKosh, getBloodBridge } from '../controllers/integrationController.js';

const router = Router();

router.use(authenticate);
router.get('/eraktkosh', getEraktKosh);
router.get('/bloodbridge', getBloodBridge);

export default router;