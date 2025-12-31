import { Router } from 'express';
import { getInsights, translateReport } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/insights/:profileId', getInsights);
router.post('/translate', translateReport);

export default router;
