import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createDonor, getDonors, updateDonor, deleteDonor, getNearby } from '../controllers/donorController.js';

const router = Router();

router.use(authenticate);
router.get('/nearby', getNearby);
router.get('/', getDonors);
router.post('/', createDonor);
router.put('/:id', updateDonor);
router.delete('/:id', deleteDonor);

export default router;