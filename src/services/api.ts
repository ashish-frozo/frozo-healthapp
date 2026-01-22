const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiClient {
    private token: string | null = localStorage.getItem('kincare_token');
    private userId: string | null = localStorage.getItem('kincare_user_id');

    setAuth(token: string, userId: string) {
        this.token = token;
        this.userId = userId;
        localStorage.setItem('kincare_token', token);
        localStorage.setItem('kincare_user_id', userId);
    }

    clearAuth() {
        this.token = null;
        this.userId = null;
        localStorage.removeItem('kincare_token');
        localStorage.removeItem('kincare_user_id');
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const headers = new Headers(options.headers);

        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        if (this.userId) {
            headers.set('x-user-id', this.userId);
        }

        if (!(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
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
