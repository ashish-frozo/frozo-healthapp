import { Router } from 'express';
import { sendNudge, getFamilyOverview } from '../controllers/familyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/overview', getFamilyOverview);
router.post('/nudge', sendNudge);

export default router;
