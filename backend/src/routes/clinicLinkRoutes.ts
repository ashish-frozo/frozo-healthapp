import { Router } from 'express';
import { createClinicLink, getClinicLink } from '../controllers/clinicLinkController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public route for doctors to view data
router.get('/:id', getClinicLink);

// Protected route for users to create links
router.post('/', authMiddleware, createClinicLink);

export default router;
