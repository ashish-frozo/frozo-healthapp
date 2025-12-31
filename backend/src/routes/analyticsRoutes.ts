import { Router } from 'express';
import { getTrends, getSafetyNetStatus } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/trends/:profileId', getTrends);
router.get('/safety-net/:profileId', getSafetyNetStatus);

export default router;
