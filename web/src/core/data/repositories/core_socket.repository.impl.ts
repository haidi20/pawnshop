import { left, right, type Either } from 'fp-ts/Either';
import { SocketDatasource } from '@/core/data/datasources/core_socket_datasource';
import type { ICoreSocketRepository } from '@/core/domain/repositories/core_socket.repository';

export class CoreSocketRepositoryImpl implements ICoreSocketRepository {
    private socketDs?: SocketDatasource;

    constructor() {
        // standalone core socket repository
    }

    async connect(url?: string, timeout = 3000): Promise<Either<Error, void>> {
        try {
            if (!this.socketDs) this.socketDs = new SocketDatasource(url);
            await this.socketDs.connect(timeout);
            return right(undefined);
        } catch (err: any) {
            return left(err instanceof Error ? err : new Error(String(err)));
        }
    }

    async disconnect(): Promise<Either<Error, void>> {
        try {
            if (!this.socketDs) return right(undefined);
            await this.socketDs.disconnect();
            this.socketDs = undefined;
            return right(undefined);
        } catch (err: any) {
            return left(err instanceof Error ? err : new Error(String(err)));
        }
    }

    async emit(event: string, payload?: any): Promise<Either<Error, void>> {
        try {
            this.socketDs && this.socketDs.emit && this.socketDs.emit(event, payload);
            return right(undefined);
        } catch (err: any) {
            return left(err instanceof Error ? err : new Error(String(err)));
        }
    }

    async subscribe(channel: string, payload?: any): Promise<Either<Error, void>> {
        try {
            this.socketDs && this.socketDs.subscribe && this.socketDs.subscribe(channel, payload);
            return right(undefined);
        } catch (err: any) {
            return left(err instanceof Error ? err : new Error(String(err)));
        }
    }

    async on(eventName: string, cb: (...args: any[]) => void): Promise<Either<Error, void>> {
        try {
            this.socketDs && this.socketDs.on && this.socketDs.on(eventName, cb);
            return right(undefined);
        } catch (err: any) {
            return left(err instanceof Error ? err : new Error(String(err)));
        }
    }

    async off(eventName: string, cb?: (...args: any[]) => void): Promise<Either<Error, void>> {
        try {
            this.socketDs && this.socketDs.off && this.socketDs.off(eventName, cb as any);
            return right(undefined);
        } catch (err: any) {
            return left(err instanceof Error ? err : new Error(String(err)));
        }
    }
}
