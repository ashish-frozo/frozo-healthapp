import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
    private io: Server | null = null;
    private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

    init(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
                methods: ['GET', 'POST'],
            },
        });

        this.io.on('connection', (socket: Socket) => {
            const userId = socket.handshake.query.userId as string;

            if (userId) {
                const sockets = this.userSockets.get(userId) || [];
                this.userSockets.set(userId, [...sockets, socket.id]);
                console.log(`👤 User ${userId} connected (Socket: ${socket.id})`);

                // Join a room for this user
                socket.join(`user:${userId}`);
            }

            socket.on('disconnect', () => {
                if (userId) {
                    const sockets = this.userSockets.get(userId) || [];
                    this.userSockets.set(userId, sockets.filter(id => id !== socket.id));
                    console.log(`👋 User ${userId} disconnected`);
                }
            });
        });
    }

    // Send a real-time event to a specific user
    sendToUser(userId: string, event: string, data: any) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }

    // Broadcast to all connected users
    broadcast(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

export const socketService = new SocketService();
