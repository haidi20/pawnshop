import { createSocket, connectSocket, disconnectSocket } from '@/core/util/socket';

export type SocketHandler = (...args: any[]) => void;

export class SocketDatasource {
    private socket: any = null;
    private url?: string;

    constructor(url?: string) {
        this.url = url;
    }

    async connect(timeout = 3000) {
        // Try initial connection (prefer polling as configured).
        this.socket = createSocket(this.url);
        try {
            await connectSocket(this.socket, timeout);
            return this.socket;
        } catch (err) {
            // Jika gagal dengan transport default (polling), coba ulang dengan websocket langsung
            try {
                const wsSocket = createSocket(this.url, { transports: ['websocket'] });
                await connectSocket(wsSocket, timeout);
                this.socket = wsSocket;
                return this.socket;
            } catch (_wsErr) {
                // Jika semua gagal, lempar error asli
                throw err;
            }
        }
    }

    async disconnect() {
        if (!this.socket) return;
        await disconnectSocket(this.socket);
        this.socket = null;
    }

    on(event: string, handler: SocketHandler) {
        if (!this.socket) return;
        this.socket.on && this.socket.on(event, handler);
    }

    off(event: string, handler?: SocketHandler) {
        if (!this.socket) return;
        if (handler) {
            this.socket.off && this.socket.off(event, handler);
        } else {
            this.socket.removeAllListeners && this.socket.removeAllListeners(event);
        }
    }

    emit(event: string, payload?: any) {
        if (!this.socket) return;
        try { this.socket.emit && this.socket.emit(event, payload); } catch (e) { /* ignore */ }
    }

    // convenience subscribe method, server may implement 'subscribe' channel
    subscribe(channel: string, payload?: any) {
        this.emit('subscribe', { channel, ...payload });
    }
}
