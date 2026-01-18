import { Router } from 'express';
import {
    createHousehold,
    getUserHouseholds,
    getHousehold,
    createInvite,
    joinHousehold,
    getHouseholdDashboard,
    updateMemberPermissions,
    removeMember,
} from '../controllers/householdController';

const router = Router();

// Household CRUD
router.post('/', createHousehold);
router.get('/', getUserHouseholds);
router.get('/:id', getHousehold);

// Invite system
router.post('/:id/invite', createInvite);
router.post('/join/:code', joinHousehold);

// Dashboard
router.get('/:id/dashboard', getHouseholdDashboard);

// Member management
router.patch('/:id/members/:memberId', updateMemberPermissions);
router.delete('/:id/members/:memberId', removeMember);

export default router;
