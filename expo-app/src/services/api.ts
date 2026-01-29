import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiClient {
    private token: string | null = null;
    private userId: string | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;
        this.token = await AsyncStorage.getItem('kincare_token');
        this.userId = await AsyncStorage.getItem('kincare_user_id');
        this.initialized = true;
    }

    async setAuth(token: string, userId: string) {
        this.token = token;
        this.userId = userId;
        await AsyncStorage.setItem('kincare_token', token);
        await AsyncStorage.setItem('kincare_user_id', userId);
    }

    async clearAuth() {
        this.token = null;
        this.userId = null;
        await AsyncStorage.removeItem('kincare_token');
        await AsyncStorage.removeItem('kincare_user_id');
    }

    async request(endpoint: string, options: RequestInit = {}) {
        await this.init();

        const headers: Record<string, string> = { ...((options.headers as Record<string, string>) || {}) };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (this.userId) {
            headers['x-user-id'] = this.userId;
        }

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `Request failed with status ${response.status}`);
        }

        return response.json();
    }

    get(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint: string, body: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    put(endpoint: string, body: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    patch(endpoint: string, body: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    delete(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
