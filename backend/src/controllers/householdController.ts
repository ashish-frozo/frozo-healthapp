import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new household
export const createHousehold = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { name } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Household name is required' });
        }

        // Generate a short invite code (6 characters)
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create household and add creator as admin
        const household = await prisma.household.create({
            data: {
                name,
                inviteCode,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: 'admin',
                        permissions: { canViewAll: true, canEditAll: true, canInvite: true },
                    },
                },
            },
            include: {
                members: {
                    include: { user: true },
                },
            },
        });

        res.status(201).json(household);
    } catch (error) {
        console.error('Error creating household:', error);
        res.status(500).json({ error: 'Failed to create household' });
    }
};

// Get user's households
export const getUserHouseholds = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const memberships = await prisma.householdMember.findMany({
            where: { userId },
            include: {
                household: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, phoneNumber: true },
                                },
                            },
                        },
                        profiles: true,
                    },
                },
            },
        });

        const households = memberships.map(m => ({
            ...m.household,
            myRole: m.role,
            myPermissions: m.permissions,
        }));

        res.json(households);
    } catch (error) {
        console.error('Error fetching households:', error);
        res.status(500).json({ error: 'Failed to fetch households' });
    }
};

// Get household by ID
export const getHousehold = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        // Check membership
        const membership = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId: id, userId } },
        });

        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this household' });
        }

        const household = await prisma.household.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, phoneNumber: true },
                        },
                    },
                },
                profiles: true,
                invites: {
                    where: { status: 'pending' },
                },
            },
        });

        res.json(household);
    } catch (error) {
        console.error('Error fetching household:', error);
        res.status(500).json({ error: 'Failed to fetch household' });
    }
};

// Create invite
export const createInvite = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { id } = req.params;
        const { phoneNumber } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check if user has invite permission
        const membership = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId: id, userId } },
        });

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can invite members' });
        }

        // Check if already a member
        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (existingUser) {
            const existingMember = await prisma.householdMember.findUnique({
                where: { householdId_userId: { householdId: id, userId: existingUser.id } },
            });

            if (existingMember) {
                return res.status(400).json({ error: 'User is already a member' });
            }
        }

        // Create or update invite
        const invite = await prisma.householdInvite.upsert({
            where: { householdId_phoneNumber: { householdId: id, phoneNumber } },
            update: {
                status: 'pending',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
            create: {
                householdId: id,
                phoneNumber,
                invitedById: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
            include: {
                household: true,
            },
        });

        // Generate invite link
        const inviteLink = `${process.env.APP_URL || 'https://kincare.frozo.ai'}/join/${invite.household.inviteCode}`;

        res.status(201).json({
            invite,
            inviteLink,
            whatsappLink: `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(
                `You've been invited to join ${invite.household.name} on KinCare! Track and share health readings with your family. Join here: ${inviteLink}`
            )}`,
        });
    } catch (error) {
        console.error('Error creating invite:', error);
        res.status(500).json({ error: 'Failed to create invite' });
    }
};

// Join household via invite code
export const joinHousehold = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { code } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        // Find household by invite code
        const household = await prisma.household.findUnique({
            where: { inviteCode: code },
        });

        if (!household) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        // Check if already a member
        const existingMember = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId: household.id, userId } },
        });

        if (existingMember) {
            return res.status(400).json({ error: 'Already a member of this household' });
        }

        // Get user to check for pending invite
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        // Mark invite as accepted if exists
        if (user) {
            await prisma.householdInvite.updateMany({
                where: {
                    householdId: household.id,
                    phoneNumber: user.phoneNumber,
                    status: 'pending',
                },
                data: { status: 'accepted' },
            });
        }

        // Add as member
        const member = await prisma.householdMember.create({
            data: {
                householdId: household.id,
                userId,
                role: 'member',
                permissions: { canViewAll: true, canEditOwn: true },
            },
            include: {
                household: true,
            },
        });

        // Link user's profile to household
        await prisma.profile.updateMany({
            where: { userId },
            data: { householdId: household.id },
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Error joining household:', error);
        res.status(500).json({ error: 'Failed to join household' });
    }
};

// Get household dashboard (all members' health data)
export const getHouseholdDashboard = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        // Check membership
        const membership = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId: id, userId } },
        });

        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this household' });
        }

        // Get all profiles in household with recent readings
        const profiles = await prisma.profile.findMany({
            where: { householdId: id },
            include: {
                user: {
                    select: { id: true, phoneNumber: true },
                },
                bpReadings: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
                glucoseReadings: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
                symptoms: {
                    orderBy: { timestamp: 'desc' },
                    take: 3,
                },
            },
        });

        // Calculate health status for each member
        const dashboard = profiles.map(profile => {
            const latestBP = profile.bpReadings[0];
            const latestGlucose = profile.glucoseReadings[0];

            let status = 'OK';
            let alerts: string[] = [];

            if (latestBP) {
                if (latestBP.systolic >= 140 || latestBP.diastolic >= 90) {
                    status = 'Attention';
                    alerts.push(`High BP: ${latestBP.systolic}/${latestBP.diastolic}`);
                }
            }

            if (latestGlucose) {
                if (latestGlucose.value >= 180) {
                    status = 'Attention';
                    alerts.push(`High Sugar: ${latestGlucose.value}`);
                }
            }

            return {
                id: profile.id,
                name: profile.name,
                relationship: profile.relationship,
                avatarUrl: profile.avatarUrl,
                ownerId: profile.userId,
                status,
                alerts,
                latestBP: latestBP ? {
                    systolic: latestBP.systolic,
                    diastolic: latestBP.diastolic,
                    status: latestBP.status,
                    timestamp: latestBP.timestamp,
                } : null,
                latestGlucose: latestGlucose ? {
                    value: latestGlucose.value,
                    context: latestGlucose.context,
                    status: latestGlucose.status,
                    timestamp: latestGlucose.timestamp,
                } : null,
                recentSymptoms: profile.symptoms,
            };
        });

        res.json({
            householdId: id,
            members: dashboard,
            summary: {
                total: dashboard.length,
                needsAttention: dashboard.filter(m => m.status === 'Attention').length,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
};

// Update member permissions
export const updateMemberPermissions = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { id, memberId } = req.params;
        const { role, permissions } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        // Check if user is admin
        const membership = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId: id, userId } },
        });

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update permissions' });
        }

        // Update member
        const updated = await prisma.householdMember.update({
            where: { id: memberId },
            data: {
                ...(role && { role }),
                ...(permissions && { permissions }),
            },
            include: {
                user: {
                    select: { id: true, phoneNumber: true },
                },
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ error: 'Failed to update permissions' });
    }
};

// Remove member from household
export const removeMember = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { id, memberId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        // Check if user is admin
        const membership = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId: id, userId } },
        });

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can remove members' });
        }

        // Get the member to remove
        const memberToRemove = await prisma.householdMember.findUnique({
            where: { id: memberId },
        });

        if (!memberToRemove) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Can't remove yourself as admin (must transfer first)
        if (memberToRemove.userId === userId) {
            return res.status(400).json({ error: 'Cannot remove yourself. Transfer admin rights first.' });
        }

        // Remove member
        await prisma.householdMember.delete({
            where: { id: memberId },
        });

        // Unlink their profiles from household
        await prisma.profile.updateMany({
            where: { userId: memberToRemove.userId, householdId: id },
            data: { householdId: null },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};
