import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            query: { userId },
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connected to real-time server');
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from real-time server');
        });
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    off(event: string) {
        if (!this.socket) return;
        this.socket.off(event);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
