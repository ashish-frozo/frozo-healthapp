import { apiClient } from './api';

export interface Household {
    id: string;
    name: string;
    inviteCode: string;
    createdById: string;
    createdAt: string;
    members: HouseholdMember[];
    profiles: any[];
    myRole?: string;
    myPermissions?: Record<string, boolean>;
}

export interface HouseholdMember {
    id: string;
    householdId: string;
    userId: string;
    role: 'admin' | 'member' | 'caregiver';
    permissions: Record<string, boolean>;
    joinedAt: string;
    user?: {
        id: string;
        phoneNumber: string;
    };
}

export interface HouseholdInvite {
    id: string;
    householdId: string;
    phoneNumber: string;
    status: 'pending' | 'accepted' | 'expired';
    expiresAt: string;
    household?: Household;
}

export interface InviteResponse {
    invite: HouseholdInvite;
    inviteLink: string;
    whatsappLink: string;
}

export interface DashboardMember {
    id: string;
    name: string;
    relationship: string;
    avatarUrl?: string;
    ownerId: string;
    status: 'OK' | 'Attention';
    alerts: string[];
    latestBP?: {
        systolic: number;
        diastolic: number;
        status: string;
        timestamp: string;
    };
    latestGlucose?: {
        value: number;
        context: string;
        status: string;
        timestamp: string;
    };
    recentSymptoms: any[];
}

export interface HouseholdDashboard {
    householdId: string;
    members: DashboardMember[];
    summary: {
        total: number;
        needsAttention: number;
    };
}

export const householdService = {
    // Create a new household
    async createHousehold(name: string): Promise<Household> {
        return apiClient.post('/households', { name });
    },

    // Get user's households
    async getHouseholds(): Promise<Household[]> {
        return apiClient.get('/households');
    },

    // Get single household
    async getHousehold(id: string): Promise<Household> {
        return apiClient.get(`/households/${id}`);
    },

    // Create invite
    async createInvite(householdId: string, phoneNumber: string): Promise<InviteResponse> {
        return apiClient.post(`/households/${householdId}/invite`, { phoneNumber });
    },

    // Join household via code
    async joinHousehold(inviteCode: string): Promise<HouseholdMember> {
        return apiClient.post(`/households/join/${inviteCode}`, {});
    },

    // Get household dashboard
    async getDashboard(householdId: string): Promise<HouseholdDashboard> {
        return apiClient.get(`/households/${householdId}/dashboard`);
    },

    // Update member permissions
    async updateMember(householdId: string, memberId: string, data: { role?: string; permissions?: Record<string, boolean> }): Promise<HouseholdMember> {
        return apiClient.patch(`/households/${householdId}/members/${memberId}`, data);
    },

    // Remove member
    async removeMember(householdId: string, memberId: string): Promise<void> {
        await apiClient.delete(`/households/${householdId}/members/${memberId}`);
    },
};
