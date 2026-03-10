// Use the client package here so Vite doesn't bundle server-side code into the browser build
import * as socketIoClient from 'socket.io-client';

// Helper util untuk inisialisasi koneksi Socket.IO pada client
// Compatible dengan server/client v2.x dan v3+/v4+ dengan mendeteksi factory secara dinamis.
export function createSocket(url?: string, opts?: any): any {
    const target = url ?? `${(globalThis as any)?.location?.protocol}//${(globalThis as any)?.location?.hostname}:8001`;
    // socketIoClient dapat mengekspor `io` sebagai named export, default, atau langsung sebagai factory tergantung versi/build
    const factory = (socketIoClient as any).io ?? (socketIoClient as any).default ?? socketIoClient;
    const baseOpts = {
        autoConnect: false,
        // paksa polling terlebih dahulu untuk menghindari kegagalan upgrade ke websocket
        // beberapa server / reverse-proxy / environment tidak mengizinkan upgrade websocket
        transports: ['polling'],
    };
    const socket = factory(target, { ...baseOpts, ...(opts || {}) });
    return socket;
}

export function connectSocket(socket: any, timeout = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off && socket.off('connect');
            socket.off && socket.off('connect_error');
            reject(new Error('timeout connecting to socket'));
        }, timeout);

        const onConnect = () => {
            clearTimeout(timer);
            resolve();
        };

        const onError = (err: any) => {
            clearTimeout(timer);
            reject(err instanceof Error ? err : new Error(String(err)));
        };

        socket.once && socket.once('connect', onConnect);
        socket.once && socket.once('connect_error', onError);

        try {
            socket.connect();
        } catch (e) {
            clearTimeout(timer);
            reject(e instanceof Error ? e : new Error(String(e)));
        }
    });
}

export function disconnectSocket(socket: any): Promise<void> {
    return new Promise((resolve) => {
        if (!socket) return resolve();
        try {
            socket.once && socket.once('disconnect', () => resolve());
            // some client versions use close()
            if (typeof socket.disconnect === 'function') socket.disconnect();
            else if (typeof socket.close === 'function') socket.close();
            else resolve();
        } catch (e) {
            resolve();
        }
    });
}
