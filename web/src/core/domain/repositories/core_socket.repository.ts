import type { Either } from 'fp-ts/lib/Either';

export interface ICoreSocketRepository {
    connect(url?: string, timeout?: number): Promise<Either<Error, void>>;
    disconnect(): Promise<Either<Error, void>>;
    emit(event: string, payload?: any): Promise<Either<Error, void>>;
    subscribe(channel: string, payload?: any): Promise<Either<Error, void>>;
    on(eventName: string, cb: (...args: any[]) => void): Promise<Either<Error, void>>;
    off(eventName: string, cb?: (...args: any[]) => void): Promise<Either<Error, void>>;
}
